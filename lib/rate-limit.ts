/**
 * Fixed-window rate limiting for public endpoints.
 *
 * Counters live in Postgres because Vercel runs many short-lived instances: an
 * in-process Map would let an attacker simply spread requests across instances.
 * The single `INSERT ... ON CONFLICT` below is atomic, so concurrent requests
 * cannot race past the limit. If the DB is unreachable we degrade to a
 * per-instance in-memory counter rather than failing open completely.
 */
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type RateLimitOptions = {
  /** Namespace, e.g. "contact" or "login:ip". */
  scope: string;
  /** Caller identity (IP, email, …). Hashed before it is stored. */
  identifier: string;
  /** Allowed requests per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  /** False once the caller has exceeded `limit` inside the window. */
  ok: boolean;
  /** Attempts recorded in the current window, including this one. */
  count: number;
  remaining: number;
  /** Seconds until the window resets — suitable for a Retry-After header. */
  retryAfterSeconds: number;
};

/** Identifiers are hashed so raw IPs and emails are never written to the DB. */
function keyFor({ scope, identifier }: Pick<RateLimitOptions, "scope" | "identifier">) {
  const digest = createHash("sha256").update(identifier).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

const fallbackCounters = new Map<string, { count: number; expiresAt: number }>();

function consumeInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = fallbackCounters.get(key);
  const entry =
    existing && existing.expiresAt > now
      ? { count: existing.count + 1, expiresAt: existing.expiresAt }
      : { count: 1, expiresAt: now + windowMs };
  fallbackCounters.set(key, entry);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (fallbackCounters.size > 5_000) {
    for (const [k, v] of fallbackCounters) if (v.expiresAt <= now) fallbackCounters.delete(k);
  }

  return {
    ok: entry.count <= limit,
    count: entry.count,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  };
}

/** Counts one attempt against the window and reports whether it is allowed. */
export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { limit, windowMs } = options;
  const key = keyFor(options);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
      INSERT INTO "RateLimit" ("id", "count", "expiresAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("id") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."expiresAt" <= ${now} THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "expiresAt" = CASE
          WHEN "RateLimit"."expiresAt" <= ${now} THEN ${resetAt}
          ELSE "RateLimit"."expiresAt"
        END
      RETURNING "count", "expiresAt"
    `;

    const row = rows[0];
    if (!row) throw new Error("upsert returned no row");

    const count = Number(row.count);
    return {
      ok: count <= limit,
      count,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((row.expiresAt.getTime() - now.getTime()) / 1000)
      ),
    };
  } catch (err) {
    console.warn(
      "[rate-limit] DB counter unavailable, falling back to in-memory:",
      err instanceof Error ? err.message : err
    );
    return consumeInMemory(key, limit, windowMs);
  }
}

/** Clears a window — call it after a legitimate success (e.g. a valid login). */
export async function resetRateLimit(
  options: Pick<RateLimitOptions, "scope" | "identifier">
): Promise<void> {
  const key = keyFor(options);
  fallbackCounters.delete(key);
  try {
    await prisma.rateLimit.deleteMany({ where: { id: key } });
  } catch {
    // Non-critical: the window expires on its own.
  }
}

/** Deletes expired rows. Fire-and-forget; called probabilistically. */
export function sweepExpiredRateLimits(): void {
  if (Math.random() > 0.02) return;
  prisma.rateLimit
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {
      // Housekeeping only.
    });
}

/**
 * Best-effort client IP. On Vercel these headers are set by the platform edge;
 * `x-forwarded-for` alone is client-controllable, so the platform-specific
 * headers are preferred and only the first hop of XFF is trusted.
 */
export function getClientIp(req?: Request | null): string {
  const headers = req?.headers;
  if (!headers) return "unknown";
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const value of candidates) {
    const ip = value?.trim();
    if (ip) return ip;
  }
  return "unknown";
}

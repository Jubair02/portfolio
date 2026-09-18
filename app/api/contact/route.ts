import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getHero } from "@/lib/data";
import { getClientIp, rateLimit, sweepExpiredRateLimits } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/schemas/contact";

/** Reject oversized payloads before parsing them. */
const MAX_BODY_BYTES = 16_000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Burst limit plus a daily cap, both per source IP. */
const IP_WINDOWS = [
  { scope: "contact:burst", limit: 3, windowMs: 10 * MINUTE },
  { scope: "contact:daily", limit: 6, windowMs: DAY },
] as const;

/**
 * The same idea keyed on the sender's address. An IP-only limit is defeated by
 * rotating IPs — a phone toggling airplane mode is enough — and this catches
 * one person doing exactly that.
 */
const EMAIL_WINDOWS = [
  { scope: "contact:email:hourly", limit: 2, windowMs: HOUR },
  { scope: "contact:email:daily", limit: 5, windowMs: DAY },
] as const;

/**
 * An absolute ceiling on outbound mail, counted across every sender at once.
 * Per-IP and per-address limits both scale with the number of identities an
 * attacker controls; this one does not, so it is what actually bounds the
 * Resend bill. Messages past the ceiling are still stored — only delivery is
 * skipped — so nothing a real visitor writes is ever lost to it.
 */
const GLOBAL_EMAIL_WINDOW = {
  scope: "contact:email:global",
  identifier: "all",
  limit: 60,
  windowMs: DAY,
} as const;

/** Keeps submitted text out of the email headers. */
function singleLine(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").trim();
}

/** "45 minutes" / "3 hours" — a day-long window in minutes reads as nonsense. */
function formatWait(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

function tooManyRequests(retryAfterSeconds: number, source: "network" | "address") {
  return NextResponse.json(
    {
      ok: false,
      error: `Too many messages from this ${source}. Please try again in about ${formatWait(
        retryAfterSeconds
      )}.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export async function POST(req: Request) {
  try {
    const declaredLength = Number(req.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Message too large." }, { status: 413 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Message too large." }, { status: 413 });
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid input." }, { status: 400 });
    }
    const { name, email, message, website } = parsed.data;
    // Empty string and undefined both mean "no topic chosen".
    const subject = parsed.data.subject?.trim() || null;

    // Bots get a success response so they have no signal to adapt to; nothing
    // is stored or sent.
    if (website && website.trim()) {
      console.info("[contact] honeypot triggered, dropping submission.");
      return NextResponse.json({ ok: true, delivered: false });
    }

    // Rate limit only after the payload is known-valid, so a flood of junk
    // requests cannot burn a legitimate visitor's quota.
    const ip = getClientIp(req);
    for (const window of IP_WINDOWS) {
      const result = await rateLimit({ ...window, identifier: ip });
      if (!result.ok) {
        console.warn(`[contact] rate limited (${window.scope}).`);
        return tooManyRequests(result.retryAfterSeconds, "network");
      }
    }

    // Addresses are matched case-insensitively so changing the capitalisation
    // doesn't buy a fresh window.
    const emailKey = email.toLowerCase();
    for (const window of EMAIL_WINDOWS) {
      const result = await rateLimit({ ...window, identifier: emailKey });
      if (!result.ok) {
        console.warn(`[contact] rate limited (${window.scope}).`);
        return tooManyRequests(result.retryAfterSeconds, "address");
      }
    }
    sweepExpiredRateLimits();

    // Persist every submission so it appears in the admin Contact Messages
    // inbox.
    //
    // This used to be best-effort, falling through to send the email anyway.
    // But a failure here means Postgres is unreachable, which also means the
    // limiter above has already degraded to a per-instance counter — and on
    // serverless that multiplies the real limit by the number of live
    // instances. Sending regardless would turn a database outage into an open
    // relay, with no stored record of what went out. Fail loudly instead: the
    // form shows the error alongside a direct mailto link.
    try {
      await prisma.contactMessage.create({ data: { name, email, subject, message } });
      await logActivity("received", "message", `from ${name}`);
    } catch (dbErr) {
      console.error("[contact] could not persist message:", dbErr);
      return NextResponse.json(
        {
          ok: false,
          error: "We couldn't save your message just now. Please email me directly.",
        },
        { status: 503 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    // Recipient comes from config, falling back to the owner address in the
    // DB — never a literal baked into this route.
    const to = process.env.CONTACT_TO_EMAIL?.trim() || (await getHero()).email;

    // If Resend is configured, deliver the email. Otherwise accept gracefully
    // (useful in local dev). See README for setup.
    if (apiKey && to) {
      // Counted here rather than beside the per-IP windows so it only ever
      // tracks sends that were actually about to happen — an environment with
      // no Resend key must not burn the ceiling.
      const globalQuota = await rateLimit(GLOBAL_EMAIL_WINDOW);
      if (!globalQuota.ok) {
        console.warn(
          "[contact] global email ceiling reached; message stored, delivery skipped."
        );
        // Only the request that trips the ceiling is logged, so a sustained
        // flood cannot bury the activity feed.
        if (globalQuota.count === GLOBAL_EMAIL_WINDOW.limit + 1) {
          await logActivity(
            "blocked",
            "message",
            `daily email ceiling reached (${GLOBAL_EMAIL_WINDOW.limit}/day) — messages are still being stored`
          );
        }
        return NextResponse.json({ ok: true, delivered: false });
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
          to: [to],
          reply_to: email,
          subject: `Portfolio contact — ${singleLine(name)}${
            subject ? ` — ${singleLine(subject)}` : ""
          }`,
          text: `New message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}${
            subject ? `\nAbout: ${subject}` : ""
          }\n\n${message}`,
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: "Delivery failed." }, { status: 502 });
      }
      return NextResponse.json({ ok: true, delivered: true });
    }

    console.info(
      apiKey
        ? "[contact] message stored (no recipient address configured)."
        : "[contact] message stored (RESEND_API_KEY not set)."
    );
    return NextResponse.json({ ok: true, delivered: false });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}

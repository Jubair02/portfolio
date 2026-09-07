import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { logActivity } from "@/lib/activity";
import { getClientIp, rateLimit, resetRateLimit, sweepExpiredRateLimits } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Brute-force protection. The login form is publicly reachable, so without a
 * lockout an attacker can grind the single admin password indefinitely.
 *
 * Two windows: one per source IP (stops a single host hammering any account)
 * and a tighter one per account (stops a distributed attack on the real admin
 * address). Counters are cleared on a successful sign-in, so in practice these
 * count *consecutive failures* and a legitimate admin is never locked out by
 * their own earlier typos.
 */
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 10;
const MAX_ATTEMPTS_PER_ACCOUNT = 5;

/**
 * A valid bcrypt hash of an unguessable value, computed once per instance, so
 * failed lookups still pay the full comparison cost.
 */
let cachedDecoyHash: string | undefined;
function decoyHash(): string {
  cachedDecoyHash ??= bcrypt.hashSync(randomBytes(24).toString("hex"), 10);
  return cachedDecoyHash;
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const account = email.toLowerCase();
        const ip = getClientIp(request as Request | undefined);
        const ipWindow = { scope: "login:ip", identifier: ip };
        const accountWindow = { scope: "login:account", identifier: account };

        const [byIp, byAccount] = await Promise.all([
          rateLimit({ ...ipWindow, limit: MAX_ATTEMPTS_PER_IP, windowMs: LOCKOUT_WINDOW_MS }),
          rateLimit({
            ...accountWindow,
            limit: MAX_ATTEMPTS_PER_ACCOUNT,
            windowMs: LOCKOUT_WINDOW_MS,
          }),
        ]);
        sweepExpiredRateLimits();

        if (!byIp.ok || !byAccount.ok) {
          const blocked = !byIp.ok ? byIp : byAccount;
          const scope = !byIp.ok ? "IP" : "account";
          const limit = !byIp.ok ? MAX_ATTEMPTS_PER_IP : MAX_ATTEMPTS_PER_ACCOUNT;
          console.warn(`[auth] Sign-in blocked: too many attempts (${scope}).`);
          // Only the attempt that trips the lockout is logged, so a sustained
          // attack cannot flood the activity feed with thousands of rows.
          if (blocked.count === limit + 1) {
            await logActivity(
              "blocked",
              "login",
              `too many failed attempts (${scope}) — locked for ${Math.ceil(
                LOCKOUT_WINDOW_MS / 60000
              )} min`
            );
          }
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Always run a real comparison so an unknown address and a wrong
        // password cost the same time, leaking nothing about which accounts
        // exist.
        const valid = await bcrypt.compare(password, user?.passwordHash ?? decoyHash());
        if (!user || !valid) return null;

        // Legitimate sign-in: clear both counters.
        await Promise.all([resetRateLimit(ipWindow), resetRateLimit(accountWindow)]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
});

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getHero } from "@/lib/data";
import { getClientIp, rateLimit, sweepExpiredRateLimits } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/schemas/contact";

/** Reject oversized payloads before parsing them. */
const MAX_BODY_BYTES = 16_000;

/** Burst limit plus a daily cap, both per IP. */
const WINDOWS = [
  { scope: "contact:burst", limit: 3, windowMs: 10 * 60 * 1000 },
  { scope: "contact:daily", limit: 12, windowMs: 24 * 60 * 60 * 1000 },
] as const;


/** Keeps submitted text out of the email headers. */
function singleLine(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").trim();
}

function tooManyRequests(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return NextResponse.json(
    {
      ok: false,
      error: `Too many messages from this network. Please try again in about ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
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

    // Bots get a success response so they have no signal to adapt to; nothing
    // is stored or sent.
    if (website && website.trim()) {
      console.info("[contact] honeypot triggered, dropping submission.");
      return NextResponse.json({ ok: true, delivered: false });
    }

    // Rate limit only after the payload is known-valid, so a flood of junk
    // requests cannot burn a legitimate visitor's quota.
    const ip = getClientIp(req);
    for (const window of WINDOWS) {
      const result = await rateLimit({ ...window, identifier: ip });
      if (!result.ok) {
        console.warn(`[contact] rate limited (${window.scope}).`);
        return tooManyRequests(result.retryAfterSeconds);
      }
    }
    sweepExpiredRateLimits();

    // Persist every submission so it appears in the admin Contact Messages
    // inbox. Best-effort: never fail the request if the DB is unavailable.
    try {
      await prisma.contactMessage.create({ data: { name, email, message } });
      await logActivity("received", "message", `from ${name}`);
    } catch (dbErr) {
      console.warn("[contact] could not persist message:", dbErr);
    }

    const apiKey = process.env.RESEND_API_KEY;
    // Recipient comes from config, falling back to the owner address in the
    // DB — never a literal baked into this route.
    const to = process.env.CONTACT_TO_EMAIL?.trim() || (await getHero()).email;

    // If Resend is configured, deliver the email. Otherwise accept gracefully
    // (useful in local dev). See README for setup.
    if (apiKey && to) {
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
          subject: `Portfolio contact — ${singleLine(name)}`,
          text: `New message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
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

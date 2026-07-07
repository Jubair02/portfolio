import { NextResponse } from "next/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    if (!name || !emailRe.test(email) || message.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Invalid input." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL || "jubu01754@gmail.com";

    // If Resend is configured, deliver the email. Otherwise accept gracefully
    // (useful in local dev). See README for setup.
    if (apiKey) {
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
          subject: `Portfolio contact — ${name}`,
          text: `New message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
        }),
      });
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: "Delivery failed." },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, delivered: true });
    }

    console.info("[contact] message received (RESEND_API_KEY not set):", {
      name,
      email,
    });
    return NextResponse.json({ ok: true, delivered: false });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400 }
    );
  }
}

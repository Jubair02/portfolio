"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getHero } from "@/lib/data";
import { logActivity } from "@/lib/activity";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";

function revalidate() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function toggleRead(id: string, read: boolean): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await prisma.contactMessage.update({ where: { id }, data: { read } });
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the message." };
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the message." };
  }
}

export async function markAllRead(): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await prisma.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update messages." };
  }
}

const replySchema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  body: z.string().trim().min(1, "Write a message.").max(5000),
});

/**
 * Answer a contact message from the inbox. Delivered through Resend from
 * CONTACT_FROM_EMAIL with your own address as reply-to, so the conversation
 * continues in your normal mailbox.
 */
export async function replyToMessage(
  id: string,
  values: { subject: string; body: string }
): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = replySchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "Email sending isn't configured — set RESEND_API_KEY, or use “Open in mail app”." };
  }

  try {
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return { ok: false, error: "Message not found." };

    const replyTo = process.env.CONTACT_TO_EMAIL?.trim() || (await getHero()).email;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [message.email],
        reply_to: replyTo,
        subject: parsed.data.subject.replace(/[\r\n\t]+/g, " "),
        text: parsed.data.body,
      }),
    });
    if (!res.ok) {
      console.error("[messages] Resend rejected the reply:", res.status, await res.text());
      return { ok: false, error: "The email service rejected the message. Check your Resend domain and sender address." };
    }

    await prisma.contactMessage.update({ where: { id }, data: { repliedAt: new Date(), read: true } });
    await logActivity("replied", "message", `to ${message.name}`);
    revalidate();
    return { ok: true };
  } catch (err) {
    console.error("[messages] reply failed:", err);
    return { ok: false, error: "Could not send the reply." };
  }
}

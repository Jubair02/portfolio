"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

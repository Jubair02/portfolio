"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email."),
  image: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function updateProfile(values: Record<string, unknown>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };
  const { name, email, image } = parsed.data;
  try {
    const clash = await prisma.user.findFirst({ where: { email, NOT: { id: admin.id } } });
    if (clash) return { ok: false, error: "That email is already in use." };
    await prisma.user.update({
      where: { id: admin.id },
      data: { name, email, image: image || null },
    });
    revalidatePath("/admin/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update your profile." };
  }
}

export async function changePassword(values: Record<string, unknown>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: admin.id } });
    if (!user) return { ok: false, error: "User not found." };
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Your current password is incorrect." };
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not change your password." };
  }
}

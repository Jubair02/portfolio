"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import { siteSettingsSchema } from "@/lib/schemas/settings";

export async function updateSiteSettings(
  values: Record<string, unknown>
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };
  const v = parsed.data;
  const data = {
    logo: v.logo || null,
    footerText: v.footerText || null,
    copyright: v.copyright || null,
    resumeUrl: v.resumeUrl || null,
    primaryColor: v.primaryColor || null,
    accentColor: v.accentColor || null,
    siteUrl: v.siteUrl || null,
  };
  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    await logActivity("updated", "site settings");
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save site settings." };
  }
}

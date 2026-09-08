"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { FIX_FIELDS_MESSAGE, toFieldErrors } from "@/lib/form-errors";
import { logActivity } from "@/lib/activity";

/**
 * Re-render every public page from the database on its next request. Saves
 * already revalidate what they touch; this is the manual escape hatch.
 */
export async function purgeSiteCache(): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
    revalidatePath("/manifest.webmanifest");
    revalidatePath("/icon");
    await logActivity("refreshed", "public site cache");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not refresh the site." };
  }
}
import { siteSettingsSchema } from "@/lib/schemas/settings";

export async function updateSiteSettings(
  values: Record<string, unknown>
): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = siteSettingsSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };
  const v = parsed.data;
  const data = {
    logo: v.logo || null,
    footerText: v.footerText || null,
    copyright: v.copyright || null,
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

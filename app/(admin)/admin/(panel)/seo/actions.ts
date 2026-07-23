"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import { seoSchema } from "@/lib/schemas/settings";

export async function updateSeo(values: Record<string, unknown>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = seoSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };
  const v = parsed.data;
  const data = {
    siteTitle: v.siteTitle,
    metaDescription: v.metaDescription,
    keywords: v.keywords,
    ogImage: v.ogImage || null,
    favicon: v.favicon || null,
  };
  try {
    await prisma.seoSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    await logActivity("updated", "SEO settings");
    revalidatePath("/");
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save SEO settings." };
  }
}

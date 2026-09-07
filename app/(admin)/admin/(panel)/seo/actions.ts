"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { FIX_FIELDS_MESSAGE, toFieldErrors } from "@/lib/form-errors";
import { logActivity } from "@/lib/activity";
import { seoSchema } from "@/lib/schemas/settings";

export async function updateSeo(values: Record<string, unknown>): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = seoSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };
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

"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { FIX_FIELDS_MESSAGE, toFieldErrors } from "@/lib/form-errors";
import { logActivity } from "@/lib/activity";
import { siteCopySchema, type SiteCopyFormValues } from "@/lib/schemas/site-copy";

export async function updateSiteCopy(values: SiteCopyFormValues): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = siteCopySchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };

  const v = parsed.data;
  const data = {
    heroStats: v.heroStats as Prisma.InputJsonValue,
    sections: v.sections as Prisma.InputJsonValue,
    aboutNote: v.aboutNote,
    techMarquee: v.techMarquee,
    achievements: v.achievements as Prisma.InputJsonValue,
    contactEyebrow: v.contact.eyebrow,
    contactTitle: v.contact.title,
    contactDescription: v.contact.description,
    contactResponseTime: v.contact.responseTime,
    githubUsername: v.githubUsername,
    miniProjects: v.miniProjects as Prisma.InputJsonValue,
    navItems: v.navItems as Prisma.InputJsonValue,
  };

  try {
    await prisma.siteCopy.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    await logActivity("updated", "site copy");
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin/copy");
    return { ok: true };
  } catch (err) {
    console.error("[site-copy] update failed:", err);
    return { ok: false, error: "Could not save the site copy." };
  }
}

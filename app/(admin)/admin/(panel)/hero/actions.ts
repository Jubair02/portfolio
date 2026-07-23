"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import { heroSchema, type HeroFormValues } from "@/lib/schemas/hero";

export async function updateHero(values: HeroFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = heroSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };

  const v = parsed.data;
  const data = {
    name: v.name,
    firstName: v.firstName,
    initials: v.initials,
    role: v.role,
    roles: v.roles,
    subheadline: v.subheadline,
    location: v.location,
    availabilityOpen: v.availabilityOpen,
    availabilityLabel: v.availabilityLabel,
    email: v.email,
    resumeUrl: v.resumeUrl,
    heroImage: v.heroImage || null,
    primaryCtaLabel: v.primaryCtaLabel,
    primaryCtaHref: v.primaryCtaHref,
    secondaryCtaLabel: v.secondaryCtaLabel,
    secondaryCtaHref: v.secondaryCtaHref,
  };

  try {
    await prisma.hero.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    await logActivity("updated", "hero", "hero section");
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true };
  } catch (err) {
    console.error("[hero] update failed:", err);
    return { ok: false, error: "Could not save the hero section." };
  }
}

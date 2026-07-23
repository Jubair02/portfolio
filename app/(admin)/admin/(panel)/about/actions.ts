"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import { aboutSchema, type AboutFormValues } from "@/lib/schemas/about";

export async function updateAbout(values: AboutFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = aboutSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };

  const v = parsed.data;
  try {
    await prisma.$transaction([
      prisma.aboutValue.deleteMany({ where: { aboutId: "singleton" } }),
      prisma.about.upsert({
        where: { id: "singleton" },
        update: {
          eyebrow: v.eyebrow,
          title: v.title,
          paragraphs: v.paragraphs,
        },
        create: {
          id: "singleton",
          eyebrow: v.eyebrow,
          title: v.title,
          paragraphs: v.paragraphs,
        },
      }),
      prisma.aboutValue.createMany({
        data: v.values.map((val, i) => ({
          aboutId: "singleton",
          icon: val.icon,
          title: val.title,
          description: val.description,
          order: i,
        })),
      }),
    ]);
    await logActivity("updated", "about", "about section");
    revalidatePath("/");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch (err) {
    console.error("[about] update failed:", err);
    return { ok: false, error: "Could not save the About section." };
  }
}

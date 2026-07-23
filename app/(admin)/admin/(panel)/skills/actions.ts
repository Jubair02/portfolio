"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import {
  categorySchema,
  skillSchema,
  type CategoryFormValues,
  type SkillFormValues,
} from "@/lib/schemas/skill";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/skills");
}

export async function upsertCategory(
  id: string | null,
  values: CategoryFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the fields." };
  const data = { icon: parsed.data.icon, title: parsed.data.title, blurb: parsed.data.blurb || null };
  try {
    if (id) {
      await prisma.skillCategory.update({ where: { id }, data });
    } else {
      const count = await prisma.skillCategory.count();
      await prisma.skillCategory.create({ data: { ...data, order: count } });
    }
    await logActivity(id ? "updated" : "created", "skill category", parsed.data.title);
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the category." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.skillCategory.delete({ where: { id } });
    await logActivity("deleted", "skill category");
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the category." };
  }
}

export async function upsertSkill(
  categoryId: string,
  id: string | null,
  values: SkillFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the fields." };
  try {
    if (id) {
      await prisma.skill.update({
        where: { id },
        data: { name: parsed.data.name, level: parsed.data.level },
      });
    } else {
      const count = await prisma.skill.count({ where: { categoryId } });
      await prisma.skill.create({
        data: { name: parsed.data.name, level: parsed.data.level, categoryId, order: count },
      });
    }
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the skill." };
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.skill.delete({ where: { id } });
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the skill." };
  }
}

export async function reorderSkills(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      ids.map((id, i) => prisma.skill.update({ where: { id }, data: { order: i } }))
    );
    revalidate();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reorder." };
  }
}

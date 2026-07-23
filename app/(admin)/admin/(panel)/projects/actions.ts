"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { projectSchema, type ProjectFormValues } from "@/lib/schemas/project";
import type { Prisma } from "@prisma/client";

type ActionResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized.");
  return session.user;
}

/** "" → null for nullable columns; map form values to a Prisma payload. */
function toData(v: ProjectFormValues): Prisma.ProjectUncheckedCreateInput {
  const orEmpty = (s?: string) => (s && s.trim() !== "" ? s.trim() : null);
  return {
    title: v.title.trim(),
    slug: v.slug.trim(),
    tagline: v.tagline.trim(),
    description: v.description.trim(),
    caseStudy: orEmpty(v.caseStudy),
    tech: v.tech,
    category: orEmpty(v.category),
    year: orEmpty(v.year),
    featured: v.featured,
    status: v.status,
    gradient: orEmpty(v.gradient),
    icon: v.icon,
    image: orEmpty(v.image),
    screenshots: v.screenshots,
    githubUrl: orEmpty(v.githubUrl),
    liveUrl: orEmpty(v.liveUrl),
    order: v.order,
  };
}

function revalidateAll() {
  revalidatePath("/admin/projects");
  revalidatePath("/"); // public site
}

export async function createProject(values: ProjectFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };

  try {
    const exists = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
    if (exists) return { ok: false, fieldErrors: { slug: "This slug is already in use." } };

    const created = await prisma.project.create({ data: toData(parsed.data) });
    await logActivity("created", "project", created.title, created.id);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    console.error("[projects] create failed:", err);
    return { ok: false, error: "Could not create project." };
  }
}

export async function updateProject(
  id: string,
  values: ProjectFormValues
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };

  try {
    const clash = await prisma.project.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (clash) return { ok: false, fieldErrors: { slug: "This slug is already in use." } };

    const updated = await prisma.project.update({
      where: { id },
      data: toData(parsed.data),
    });
    await logActivity("updated", "project", updated.title, updated.id);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    console.error("[projects] update failed:", err);
    return { ok: false, error: "Could not update project." };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await prisma.project.delete({ where: { id } });
    await logActivity("deleted", "project", deleted.title, id);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    console.error("[projects] delete failed:", err);
    return { ok: false, error: "Could not delete project." };
  }
}

export async function toggleFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.project.update({ where: { id }, data: { featured } });
    revalidateAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update." };
  }
}

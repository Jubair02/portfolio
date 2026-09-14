"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { FIX_FIELDS_MESSAGE, toFieldErrors } from "@/lib/form-errors";
import { logActivity } from "@/lib/activity";
import { projectSchema, type ProjectFormValues } from "@/lib/schemas/project";
import { Prisma } from "@prisma/client";

/** "" → null for nullable columns; map form values to a Prisma payload. */
function toData(v: ProjectFormValues): Prisma.ProjectUncheckedCreateInput {
  const orEmpty = (s?: string) => (s && s.trim() !== "" ? s.trim() : null);
  return {
    title: v.title.trim(),
    slug: v.slug.trim(),
    tagline: v.tagline.trim(),
    description: v.description.trim(),
    caseStudy: orEmpty(v.caseStudy),
    metrics: v.metrics.length > 0 ? (v.metrics as Prisma.InputJsonValue) : Prisma.DbNull,
    tech: v.tech,
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
  revalidatePath("/"); // landing page (featured)
  revalidatePath("/projects", "layout"); // catalogue + every project page
}

export async function createProject(values: ProjectFormValues): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };

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
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };

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
  const denied = await adminGuard();
  if (denied) return denied;
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
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await prisma.project.update({ where: { id }, data: { featured } });
    revalidateAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update." };
  }
}

export async function toggleStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED"
): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const updated = await prisma.project.update({ where: { id }, data: { status } });
    await logActivity(
      status === "PUBLISHED" ? "published" : "unpublished",
      "project",
      updated.title,
      id
    );
    revalidateAll();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update." };
  }
}

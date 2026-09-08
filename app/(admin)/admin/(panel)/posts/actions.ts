"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { crudCreate, crudUpdate, crudDelete, crudReorder, type CrudConfig } from "@/lib/crud";
import { FIX_FIELDS_MESSAGE } from "@/lib/form-errors";
import type { ActionResult } from "@/lib/auth-guard";
import { postSchema, type PostFormValues } from "@/lib/schemas/post";

const cfg: CrudConfig<PostFormValues> = {
  model: "post",
  entity: "post",
  schema: postSchema,
  paths: ["/admin/posts"],
  labelField: "title",
  toData: (v) => ({
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    tag: v.tag || null,
    readingTime: v.readingTime || null,
    // Noon UTC keeps the calendar date stable in every timezone.
    publishedAt: new Date(`${v.publishedAt}T12:00:00.000Z`),
    status: v.status,
    externalUrl: v.externalUrl || null,
    coverImage: v.coverImage || null,
    content: v.content,
  }),
};

/** The public post pages are their own route segment; refresh them all. */
function revalidateBlog() {
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
}

async function slugClash(values: Record<string, unknown>, exceptId?: string): Promise<ActionResult | null> {
  const slug = typeof values.slug === "string" ? values.slug.trim() : "";
  if (!slug) return null;
  try {
    const clash = await prisma.post.findFirst({
      where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
      select: { id: true },
    });
    if (clash) {
      return { ok: false, error: FIX_FIELDS_MESSAGE, fieldErrors: { slug: "This slug is already in use." } };
    }
  } catch {
    // Let the create/update surface the real error.
  }
  return null;
}

export async function createPost(values: Record<string, unknown>) {
  const clash = await slugClash(values);
  if (clash) return clash;
  const res = await crudCreate(cfg, values);
  if (res.ok) revalidateBlog();
  return res;
}
export async function updatePost(id: string, values: Record<string, unknown>) {
  const clash = await slugClash(values, id);
  if (clash) return clash;
  const res = await crudUpdate(cfg, id, values);
  if (res.ok) revalidateBlog();
  return res;
}
export async function deletePost(id: string) {
  const res = await crudDelete(cfg, id);
  if (res.ok) revalidateBlog();
  return res;
}
/** `ids` in the new display order. */
export async function reorderPosts(ids: string[]) {
  const res = await crudReorder(cfg, ids);
  if (res.ok) revalidateBlog();
  return res;
}

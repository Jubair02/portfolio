import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createPost, updatePost, deletePost, reorderPosts } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    hint: "Becomes the address: /blog/<slug>. Lowercase letters, numbers and dashes.",
  },
  { name: "tag", label: "Tag", type: "text", placeholder: "React" },
  { name: "readingTime", label: "Reading time", type: "text", placeholder: "5 min read" },
  { name: "publishedAt", label: "Publish date", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft (hidden)", value: "DRAFT" },
      { label: "Published", value: "PUBLISHED" },
    ],
    defaultValue: "DRAFT",
  },
  { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, hint: "One or two sentences shown on the card." },
  {
    name: "externalUrl",
    label: "External link (optional)",
    type: "text",
    placeholder: "https://…",
    hint: "If the article lives elsewhere (Medium, Dev.to…), paste it here and the card links straight to it.",
  },
  { name: "coverImage", label: "Cover image (optional)", type: "image", folder: "portfolio/blog" },
  {
    name: "content",
    label: "Article",
    type: "textarea",
    rows: 16,
    hint: "Plain text. Blank line = new paragraph · “## Heading” · “- list item” · **bold** · `code` · [link](https://…).",
  },
];

async function getItems() {
  try {
    const rows = await prisma.post.findMany({ orderBy: [{ order: "asc" }, { publishedAt: "desc" }] });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      tag: p.tag ?? "",
      readingTime: p.readingTime ?? "",
      publishedAt: p.publishedAt.toISOString().slice(0, 10),
      status: p.status,
      excerpt: p.excerpt,
      externalUrl: p.externalUrl ?? "",
      coverImage: p.coverImage ?? "",
      content: p.content,
      // List subtitle only; not a form field.
      summary: `${p.status === "PUBLISHED" ? "Published" : "Draft"} · ${p.publishedAt.toISOString().slice(0, 10)} · /blog/${p.slug}`,
    }));
  } catch {
    return [];
  }
}

export default async function PostsAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description="Write articles here or link to ones published elsewhere. Only published posts appear on the site."
      />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="title"
        subtitleKey="summary"
        imageKey="coverImage"
        addLabel="New post"
        emptyLabel="No posts yet. The Blog section stays hidden until you publish one."
        create={createPost}
        update={updatePost}
        remove={deletePost}
        reorder={reorderPosts}
      />
    </div>
  );
}

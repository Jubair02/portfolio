import { z } from "zod";
import { optionalHttpUrlSchema } from "@/lib/schemas/url";

export const POST_STATUSES = ["DRAFT", "PUBLISHED"] as const;

/**
 * A blog post is either written here (content) or lives elsewhere
 * (externalUrl). Cards link to the external URL when present, otherwise to
 * /blog/<slug>, so at least one of the two must be filled in.
 */
export const postSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
    excerpt: z.string().trim().min(1, "Excerpt is required.").max(300, "Keep the excerpt under 300 characters."),
    tag: z.string().trim().max(30, "Keep the tag short.").optional(),
    readingTime: z.string().trim().max(30).optional(),
    /** YYYY-MM-DD from the date input. */
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a publish date."),
    status: z.enum(POST_STATUSES),
    externalUrl: optionalHttpUrlSchema,
    coverImage: z.string().optional(),
    content: z.string(),
  })
  .refine((v) => v.content.trim().length > 0 || Boolean(v.externalUrl), {
    message: "Write the article here, or add an external link to it.",
    path: ["content"],
  });

export type PostFormValues = z.infer<typeof postSchema>;

export const slugifyTitle = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

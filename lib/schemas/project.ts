import { z } from "zod";
import { iconNameSchema } from "@/lib/schemas/icon";
import { optionalHttpUrlSchema } from "@/lib/schemas/url";
import { toEmbedUrl } from "@/lib/video";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
  tagline: z.string().min(1, "A short description is required."),
  description: z.string().min(1, "A full description is required."),
  caseStudy: z.string().optional(),
  metrics: z.array(
    z.object({
      label: z.string().min(1, "Label is required."),
      value: z.string().min(1, "Value is required."),
    })
  ),
  tech: z.array(z.string().min(1)),
  year: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  gradient: z.string().optional(),
  icon: iconNameSchema,
  image: z.string().optional(),
  screenshots: z.array(z.string()),
  deck: z
    .object({
      url: z.string().min(1),
      publicId: z.string().optional(),
      pages: z.number().int().min(1),
      label: z.string().optional(),
    })
    .nullable(),
  attachments: z.array(
    z.object({
      label: z.string().min(1, "Give the file a label."),
      url: z.string().min(1, "Upload a file."),
      publicId: z.string().optional(),
    })
  ),
  features: z.array(z.string().min(1)),
  challenges: z.string().optional(),
  learnings: z.string().optional(),
  videoUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .refine((v) => toEmbedUrl(v) !== null, "Paste a YouTube or Vimeo link."),
    ])
    .optional(),
  architectureImage: z.string().optional(),
  architectureNote: z.string().optional(),
  feedbackQuote: z.string().optional(),
  feedbackAuthor: z.string().optional(),
  feedbackRole: z.string().optional(),
  metaTitle: z.string().max(70, "Keep it under 70 characters.").optional(),
  metaDescription: z.string().max(160, "Keep it under 160 characters.").optional(),
  ogImage: z.string().optional(),
  demoAccounts: z.array(
    z.object({
      role: z.string().min(1, "Name the role, for example Admin."),
      username: z.string().optional(),
      password: z.string().optional(),
      note: z.string().optional(),
    })
  ),
  githubUrl: optionalHttpUrlSchema,
  liveUrl: optionalHttpUrlSchema,
  order: z.number().int(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectDefaults: ProjectFormValues = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  caseStudy: "",
  metrics: [],
  tech: [],
  year: "",
  featured: false,
  status: "PUBLISHED",
  gradient: "from-primary via-accent-2 to-accent",
  icon: "Sparkles",
  image: "",
  screenshots: [],
  deck: null,
  attachments: [],
  demoAccounts: [],
  features: [],
  challenges: "",
  learnings: "",
  videoUrl: "",
  architectureImage: "",
  architectureNote: "",
  feedbackQuote: "",
  feedbackAuthor: "",
  feedbackRole: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  githubUrl: "",
  liveUrl: "",
  order: 0,
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

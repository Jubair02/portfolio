import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
  tagline: z.string().min(1, "A short description is required."),
  description: z.string().min(1, "A full description is required."),
  caseStudy: z.string().optional(),
  tech: z.array(z.string().min(1)),
  category: z.string().optional(),
  year: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  gradient: z.string().optional(),
  icon: z.string().min(1),
  image: z.string().optional(),
  screenshots: z.array(z.string()),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  order: z.number().int(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectDefaults: ProjectFormValues = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  caseStudy: "",
  tech: [],
  category: "",
  year: "",
  featured: false,
  status: "PUBLISHED",
  gradient: "from-primary via-accent-2 to-accent",
  icon: "Sparkles",
  image: "",
  screenshots: [],
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

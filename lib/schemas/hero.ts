import { z } from "zod";

export const heroSchema = z.object({
  name: z.string().min(1, "Name is required."),
  firstName: z.string().min(1, "First name is required."),
  initials: z.string().min(1, "Initials are required."),
  role: z.string().min(1, "Title is required."),
  roles: z.array(z.string().min(1)).min(1, "Add at least one rotating role."),
  headline: z.string().min(1, "Headline is required."),
  subheadline: z.string().min(1, "Subtitle is required."),
  location: z.string().min(1),
  availabilityOpen: z.boolean(),
  availabilityLabel: z.string().min(1),
  email: z.string().email("Enter a valid email."),
  resumeUrl: z
    .string()
    .trim()
    .min(1, "Add a résumé link or upload a PDF.")
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
      "Use a site path like /Resume.pdf or a full https:// URL."
    ),
  heroImage: z.string().optional(),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaHref: z.string().min(1),
});

export type HeroFormValues = z.infer<typeof heroSchema>;

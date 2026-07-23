import { z } from "zod";

export const heroSchema = z.object({
  name: z.string().min(1, "Name is required."),
  firstName: z.string().min(1, "First name is required."),
  initials: z.string().min(1, "Initials are required."),
  role: z.string().min(1, "Title is required."),
  roles: z.array(z.string().min(1)),
  subheadline: z.string().min(1, "Subtitle is required."),
  location: z.string().min(1),
  availabilityOpen: z.boolean(),
  availabilityLabel: z.string().min(1),
  email: z.string().email("Enter a valid email."),
  resumeUrl: z.string().min(1),
  heroImage: z.string().optional(),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaHref: z.string().min(1),
});

export type HeroFormValues = z.infer<typeof heroSchema>;

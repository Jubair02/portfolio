import { z } from "zod";

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required."),
  position: z.string().min(1, "Position is required."),
  duration: z.string().min(1, "Duration is required."),
  location: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()),
  tags: z.array(z.string()),
  logo: z.string().optional(),
  icon: z.string().min(1),
});
export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  institute: z.string().min(1, "Institute is required."),
  degree: z.string().min(1, "Degree is required."),
  duration: z.string().min(1, "Duration is required."),
  result: z.string().optional(),
  logo: z.string().optional(),
  icon: z.string().min(1),
});
export type EducationFormValues = z.infer<typeof educationSchema>;

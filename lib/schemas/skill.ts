import { z } from "zod";

export const categorySchema = z.object({
  icon: z.string().min(1, "Icon is required."),
  title: z.string().min(1, "Title is required."),
  blurb: z.string().optional(),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required."),
  level: z.coerce.number().int().min(0).max(100),
});
export type SkillFormValues = z.infer<typeof skillSchema>;

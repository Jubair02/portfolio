import { z } from "zod";
import { iconNameSchema } from "@/lib/schemas/icon";

export const aboutSchema = z.object({
  eyebrow: z.string().min(1, "Eyebrow is required."),
  title: z.string().min(1, "Title is required."),
  paragraphs: z.array(z.string().min(1, "Paragraph cannot be empty.")).min(1),
  values: z.array(
    z.object({
      icon: iconNameSchema,
      title: z.string().min(1),
      description: z.string().min(1),
    })
  ),
});

export type AboutFormValues = z.infer<typeof aboutSchema>;

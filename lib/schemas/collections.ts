import { z } from "zod";
import { iconNameSchema, optionalIconNameSchema } from "@/lib/schemas/icon";

export const certificateSchema = z.object({
  title: z.string().min(1, "Title is required."),
  organization: z.string().min(1, "Organization is required."),
  date: z.string().min(1, "Date is required."),
  image: z.string().optional(),
  credentialUrl: z.string().optional(),
  icon: iconNameSchema,
});
export type CertificateFormValues = z.infer<typeof certificateSchema>;

export const serviceSchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  features: z.array(z.string()),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required."),
  designation: z.string().optional(),
  company: z.string().optional(),
  image: z.string().optional(),
  review: z.string().min(1, "Review is required."),
  rating: z.coerce.number().int().min(1).max(5),
  initials: z.string().optional(),
});
export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export const socialSchema = z.object({
  platform: z.string().min(1, "Platform is required."),
  url: z.string().min(1, "URL is required."),
  icon: optionalIconNameSchema.optional(),
  visible: z.boolean(),
});
export type SocialFormValues = z.infer<typeof socialSchema>;

import { z } from "zod";

export const seoSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required."),
  metaDescription: z.string().min(1, "Meta description is required."),
  keywords: z.array(z.string()),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});
export type SeoFormValues = z.infer<typeof seoSchema>;

export const siteSettingsSchema = z.object({
  logo: z.string().optional(),
  footerText: z.string().optional(),
  copyright: z.string().optional(),
  resumeUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  siteUrl: z.string().optional(),
});
export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

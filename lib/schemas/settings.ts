import { z } from "zod";
import { httpUrlSchema } from "@/lib/schemas/url";

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
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  /**
   * Drives metadataBase, canonical, OG and sitemap URLs, so it must parse.
   * Empty means "fall back to NEXT_PUBLIC_SITE_URL / content/site.ts".
   */
  siteUrl: z.union([z.literal(""), httpUrlSchema]).optional(),
});
export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

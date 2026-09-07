import { z } from "zod";

export const seoSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required."),
  metaDescription: z.string().min(1, "Meta description is required."),
  keywords: z.array(z.string()),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});
export type SeoFormValues = z.infer<typeof seoSchema>;

/**
 * The site URL is fed to `new URL()` in `app/(site)/layout.tsx` (metadataBase),
 * so an unparseable value would throw on every public request. Require a full
 * absolute http(s) URL; empty means "use the default from content/site.ts".
 */
const absoluteUrl = z
  .string()
  .url("Enter a full URL including https:// — e.g. https://jhossain.vercel.app")
  .refine(
    (v) => /^https?:\/\//i.test(v),
    "Site URL must start with http:// or https://"
  );

export const siteSettingsSchema = z.object({
  logo: z.string().optional(),
  footerText: z.string().optional(),
  copyright: z.string().optional(),
  resumeUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  siteUrl: z.union([z.literal(""), absoluteUrl]).optional(),
});
export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Keep the sitemap/host in step with Site Settings without hitting the DB on
// every crawl.
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = await getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The CMS and its login form have no business in a search index.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}

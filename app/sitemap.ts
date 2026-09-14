import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getPosts } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [url, posts] = await Promise.all([getSiteUrl(), getPosts()]);
  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${url}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Only posts with their own page; link-only posts point elsewhere.
    ...posts
      .filter((p) => !p.externalUrl || p.content.trim())
      .map((p) => ({
        url: `${url}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ];
}

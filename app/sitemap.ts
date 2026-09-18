import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getPosts, getProjects } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [url, posts, projects] = await Promise.all([getSiteUrl(), getPosts(), getProjects()]);
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
    {
      url: `${url}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    ...projects
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${url}/projects/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
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

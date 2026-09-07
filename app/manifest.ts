import type { MetadataRoute } from "next";
import { getHero, getSeo } from "@/lib/data";

export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [hero, seo] = await Promise.all([getHero(), getSeo()]);
  return {
    name: seo.siteTitle,
    short_name: hero.name,
    description: seo.metaDescription,
    // Deliberately relative: an absolute start_url pinned to the configured
    // domain would break installs on any other host (previews, custom domain
    // swaps) and is the other way SEO files drift off-origin.
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

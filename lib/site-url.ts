/**
 * Canonical origin for the public site.
 *
 * Everything that emits an absolute URL (robots, sitemap, manifest, JSON-LD,
 * metadataBase) must go through here so a single value in Admin → Settings
 * drives them all. Without it the SEO surface drifts between hosts, which is
 * how canonical/OG tags end up pointing at a domain that isn't served.
 *
 * Precedence: Site Settings → NEXT_PUBLIC_SITE_URL → content/site.ts.
 */
import { site } from "@/content/site";
import { getSiteSettings } from "@/lib/data";

/** Returns an absolute http(s) URL with no trailing slash. */
export function normalizeSiteUrl(value?: string | null): string {
  const candidates = [value, process.env.NEXT_PUBLIC_SITE_URL, site.url];
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      return url.href.replace(/\/+$/, "");
    } catch {
      // Unparseable — try the next candidate rather than throwing, so a bad
      // value saved in the DB can never take the public site down.
      console.warn(`[site-url] Ignoring unparseable site URL: ${trimmed}`);
    }
  }
  return site.url;
}

/** DB-backed canonical origin, safe to call from any server context. */
export async function getSiteUrl(): Promise<string> {
  const settings = await getSiteSettings(); // already falls back internally
  return normalizeSiteUrl(settings.siteUrl);
}

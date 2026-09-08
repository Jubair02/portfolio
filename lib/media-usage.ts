/**
 * Where each uploaded file is referenced by content. One scan of every table
 * that stores an asset URL, returned as url → human-readable places. Used by
 * the Media Library ("Used in …" badges, "Delete unused") and by the delete
 * action, which refuses to remove an asset that is still on the live site.
 */
import { prisma } from "@/lib/prisma";

export type UsageMap = Map<string, string[]>;

function add(map: UsageMap, url: string | null | undefined, place: string) {
  if (!url) return;
  const list = map.get(url) ?? [];
  list.push(place);
  map.set(url, list);
}

export async function collectImageUsages(): Promise<UsageMap> {
  const [hero, projects, testimonials, certificates, experiences, educations, settings, seo, users, posts] =
    await Promise.all([
      prisma.hero.findUnique({
        where: { id: "singleton" },
        select: { heroImage: true, backgroundImage: true, resumeUrl: true },
      }),
      prisma.project.findMany({ select: { title: true, image: true, screenshots: true } }),
      prisma.testimonial.findMany({ select: { name: true, image: true } }),
      prisma.certificate.findMany({ select: { title: true, image: true } }),
      prisma.experience.findMany({ select: { company: true, logo: true } }),
      prisma.education.findMany({ select: { institute: true, logo: true } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { logo: true } }),
      prisma.seoSettings.findUnique({ where: { id: "singleton" }, select: { ogImage: true, favicon: true } }),
      prisma.user.findMany({ select: { name: true, image: true } }),
      prisma.post.findMany({ select: { title: true, coverImage: true } }),
    ]);

  const map: UsageMap = new Map();
  add(map, hero?.heroImage, "Hero image");
  add(map, hero?.backgroundImage, "Hero background");
  add(map, hero?.resumeUrl, "the résumé link on the Hero page");
  for (const p of projects) {
    add(map, p.image, `project “${p.title}”`);
    for (const s of p.screenshots) add(map, s, `project “${p.title}” (screenshot)`);
  }
  for (const t of testimonials) add(map, t.image, `testimonial from ${t.name}`);
  for (const c of certificates) add(map, c.image, `certificate “${c.title}”`);
  for (const e of experiences) add(map, e.logo, `experience at ${e.company}`);
  for (const e of educations) add(map, e.logo, `education at ${e.institute}`);
  add(map, settings?.logo, "Site Settings logo");
  add(map, seo?.ogImage, "SEO Open Graph image");
  add(map, seo?.favicon, "SEO favicon");
  for (const u of users) add(map, u.image, `profile picture of ${u.name}`);
  for (const p of posts) add(map, p.coverImage, `blog post “${p.title}”`);
  return map;
}

/** Places that reference one URL. */
export async function findImageUsages(url: string): Promise<string[]> {
  const map = await collectImageUsages();
  return map.get(url) ?? [];
}

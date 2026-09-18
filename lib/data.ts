/**
 * Server-side data-access layer for the PUBLIC site.
 *
 * Reads live content from the database. Falls back to the static content in
 * content/site.ts ONLY when the query throws (DB unreachable / not migrated),
 * so the site still renders during an outage.
 *
 * An empty table is a legitimate, editor-chosen state — not a failure. Zero
 * rows returns an empty list and the matching public section hides itself.
 * Treating "empty" as "unavailable" made it impossible to clear a section from
 * the admin: deleting every row simply resurrected the static placeholders.
 */
import { cache } from "react";
import type { Project as ProjectRecord } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveNavTarget } from "@/lib/nav";
import {
  projects as staticProjects,
  about as staticAbout,
  skillCategories as staticSkills,
  experience as staticExperience,
  services as staticServices,
  certifications as staticCerts,
  testimonials as staticTestimonials,
  site,
  type Project,
  type ProjectDeck,
  type ProjectAttachment,
  type DemoAccount,
} from "@/content/site";
import type { IconName } from "@/components/icons";
import { siteCopySchema, type SiteCopyFormValues } from "@/lib/schemas/site-copy";
import { staticSiteCopy } from "@/lib/site-copy-defaults";

type Metric = { label: string; value: string };

export type SkillCategoryData = {
  icon: IconName;
  title: string;
  blurb: string | null;
  skills: { name: string; level: number }[];
};

export type ExperienceData = {
  company: string;
  position: string;
  duration: string;
  location: string | null;
  description: string | null;
  highlights: string[];
  tags: string[];
  logo: string | null;
  icon: IconName;
};

export type EducationData = {
  institute: string;
  degree: string;
  duration: string;
  result: string | null;
  logo: string | null;
  icon: IconName;
};

export type ServiceData = {
  icon: IconName;
  title: string;
  description: string;
  features: string[];
};

export type CertificateData = {
  title: string;
  organization: string;
  date: string;
  image: string | null;
  credentialUrl: string | null;
  icon: IconName;
};

export type TestimonialData = {
  name: string;
  designation: string | null;
  company: string | null;
  image: string | null;
  review: string;
  rating: number;
  initials: string | null;
};

export type SocialLinkData = {
  platform: string;
  url: string;
  /** Optional Lucide icon name overriding the platform-derived default. */
  icon: string | null;
};

export type SeoData = {
  siteTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string | null;
  favicon: string | null;
};

export type SiteSettingsData = {
  logo: string | null;
  footerText: string | null;
  copyright: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  siteUrl: string;
};

export type HeroData = {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  roles: string[];
  headline: string;
  subheadline: string;
  location: string;
  availabilityOpen: boolean;
  availabilityLabel: string;
  email: string;
  resumeUrl: string;
  heroImage: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type AboutData = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  values: { icon: IconName; title: string; description: string }[];
};

const heroFallback: HeroData = {
  name: site.name,
  firstName: site.firstName,
  initials: site.initials,
  role: site.role,
  roles: [...site.roles],
  headline: "I build **fast, elegant** web experiences.",
  subheadline: site.subheadline,
  location: site.location,
  availabilityOpen: site.availability.open,
  availabilityLabel: site.availability.label,
  email: site.email,
  resumeUrl: site.resumeUrl,
  heroImage: "/jubair-portrait.jpg",
  primaryCtaLabel: "View my work",
  primaryCtaHref: "#work",
  secondaryCtaLabel: "Get in touch",
  secondaryCtaHref: "/contact",
};

const aboutFallback: AboutData = {
  eyebrow: staticAbout.eyebrow,
  title: staticAbout.title,
  paragraphs: [...staticAbout.paragraphs],
  values: staticAbout.values.map((v) => ({
    icon: v.icon as IconName,
    title: v.title,
    description: v.description,
  })),
};

export async function getHero(): Promise<HeroData> {
  try {
    const h = await prisma.hero.findUnique({ where: { id: "singleton" } });
    if (!h) return heroFallback;
    return {
      name: h.name,
      firstName: h.firstName,
      initials: h.initials,
      role: h.role,
      roles: h.roles,
      headline: h.headline,
      subheadline: h.subheadline,
      location: h.location,
      availabilityOpen: h.availabilityOpen,
      availabilityLabel: h.availabilityLabel,
      email: h.email,
      resumeUrl: h.resumeUrl,
      heroImage: h.heroImage ?? "/jubair-portrait.jpg",
      primaryCtaLabel: h.primaryCtaLabel,
      primaryCtaHref: resolveNavTarget(h.primaryCtaHref),
      secondaryCtaLabel: h.secondaryCtaLabel,
      secondaryCtaHref: resolveNavTarget(h.secondaryCtaHref),
    };
  } catch {
    return heroFallback;
  }
}

export async function getAbout(): Promise<AboutData> {
  try {
    const a = await prisma.about.findUnique({
      where: { id: "singleton" },
      include: { values: { orderBy: { order: "asc" } } },
    });
    if (!a) return aboutFallback;
    return {
      eyebrow: a.eyebrow,
      title: a.title,
      paragraphs: a.paragraphs,
      values: a.values.map((v) => ({
        icon: v.icon as IconName,
        title: v.title,
        description: v.description,
      })),
    };
  } catch {
    return aboutFallback;
  }
}

export async function getSkills(): Promise<SkillCategoryData[]> {
  try {
    const cats = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    });
    return cats.map((c) => ({
      icon: c.icon as IconName,
      title: c.title,
      blurb: c.blurb,
      skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
    }));
  } catch {
    return staticSkills.map((c) => ({
      icon: c.icon as IconName,
      title: c.title,
      blurb: c.blurb,
      skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
    }));
  }
}

export async function getExperience(): Promise<ExperienceData[]> {
  try {
    const rows = await prisma.experience.findMany({ orderBy: { order: "asc" } });
    return rows.map((e) => ({
      company: e.company,
      position: e.position,
      duration: e.duration,
      location: e.location,
      description: e.description,
      highlights: e.highlights,
      tags: e.tags,
      logo: e.logo,
      icon: e.icon as IconName,
    }));
  } catch {
    return staticExperience.map((e) => ({
      company: e.org,
      position: e.role,
      duration: e.period,
      location: e.location || null,
      description: null,
      highlights: [...e.highlights],
      tags: [...e.tags],
      logo: null,
      icon: e.icon as IconName,
    }));
  }
}

export async function getEducation(): Promise<EducationData[]> {
  try {
    const rows = await prisma.education.findMany({ orderBy: { order: "asc" } });
    return rows.map((e) => ({
      institute: e.institute,
      degree: e.degree,
      duration: e.duration,
      result: e.result,
      logo: e.logo,
      icon: e.icon as IconName,
    }));
  } catch {
    return [
      {
        institute: "North South University",
        degree: "B.Sc. in Computer Science & Engineering",
        duration: "2021 — 2026",
        result: null,
        logo: null,
        icon: "GraduationCap",
      },
    ];
  }
}

export async function getServices(): Promise<ServiceData[]> {
  try {
    const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return rows.map((s) => ({
      icon: s.icon as IconName,
      title: s.title,
      description: s.description,
      features: s.features,
    }));
  } catch {
    return staticServices.map((s) => ({
      icon: s.icon as IconName,
      title: s.title,
      description: s.description,
      features: [...s.features],
    }));
  }
}

export async function getCertificates(): Promise<CertificateData[]> {
  try {
    const rows = await prisma.certificate.findMany({ orderBy: { order: "asc" } });
    return rows.map((c) => ({
      title: c.title,
      organization: c.organization,
      date: c.date,
      image: c.image,
      credentialUrl: c.credentialUrl,
      icon: c.icon as IconName,
    }));
  } catch {
    return staticCerts.map((c) => ({
      title: c.title,
      organization: c.issuer,
      date: c.year,
      image: null,
      credentialUrl: null,
      icon: c.icon as IconName,
    }));
  }
}

export async function getTestimonials(): Promise<TestimonialData[]> {
  try {
    const rows = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
    return rows.map((t) => ({
      name: t.name,
      designation: t.designation,
      company: t.company,
      image: t.image,
      review: t.review,
      rating: t.rating,
      initials: t.initials,
    }));
  } catch {
    return staticTestimonials.map((t) => ({
      name: t.name,
      designation: t.title,
      company: t.company,
      image: null,
      review: t.quote,
      rating: 5,
      initials: t.initials,
    }));
  }
}

export async function getSeo(): Promise<SeoData> {
  const fallback: SeoData = {
    siteTitle: `${site.name} — ${site.role}`,
    metaDescription: site.subheadline,
    keywords: [site.name, "Full-Stack Developer", "React Developer", "Next.js Developer"],
    ogImage: null,
    favicon: null,
  };
  try {
    const s = await prisma.seoSettings.findUnique({ where: { id: "singleton" } });
    if (!s) return fallback;
    return {
      siteTitle: s.siteTitle,
      metaDescription: s.metaDescription,
      keywords: s.keywords,
      ogImage: s.ogImage,
      favicon: s.favicon,
    };
  } catch {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const fallback: SiteSettingsData = {
    logo: null,
    footerText: `${site.role} building fast, elegant products for the web.`,
    copyright: `© ${site.name}. All rights reserved.`,
    primaryColor: null,
    accentColor: null,
    siteUrl: site.url,
  };
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s) return fallback;
    return {
      logo: s.logo,
      footerText: s.footerText,
      copyright: s.copyright,
      primaryColor: s.primaryColor,
      accentColor: s.accentColor,
      siteUrl: s.siteUrl ?? site.url,
    };
  } catch {
    return fallback;
  }
}

export async function getSocialLinks(): Promise<SocialLinkData[]> {
  try {
    const rows = await prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
    return rows.map((s) => ({
      platform: s.platform,
      url: s.url,
      icon: s.icon || null,
    }));
  } catch {
    return [
      { platform: "GitHub", url: site.socials.github, icon: null },
      { platform: "LinkedIn", url: site.socials.linkedin, icon: null },
      { platform: "Email", url: site.socials.email, icon: null },
    ];
  }
}

/**
 * Retry a query through a short backoff.
 *
 * Static generation renders many pages at once, each opening its own
 * connection, and a pooled database will occasionally refuse one. Without this
 * a single blip during a build is baked into the output permanently.
 */
async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
      }
    }
  }
  throw lastError;
}

/* The three Json columns below are validated on the way out as well as in:
 * a hand-edited or restored row must never crash a public page. */

/** A deck row, or null when absent or malformed. */
export function parseDeck(value: unknown): ProjectDeck | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const d = value as Record<string, unknown>;
  const pages = Number(d.pages);
  if (typeof d.url !== "string" || !d.url) return null;
  if (!Number.isFinite(pages) || pages < 1) return null;
  return {
    url: d.url,
    publicId: typeof d.publicId === "string" ? d.publicId : undefined,
    pages: Math.floor(pages),
    label: typeof d.label === "string" && d.label ? d.label : undefined,
  };
}

/** Attachment rows that have both a label and a URL. */
export function parseAttachments(value: unknown): ProjectAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const a = entry as Record<string, unknown> | null;
    if (!a || typeof a.label !== "string" || !a.label) return [];
    if (typeof a.url !== "string" || !a.url) return [];
    return [{
      label: a.label,
      url: a.url,
      publicId: typeof a.publicId === "string" ? a.publicId : undefined,
    }];
  });
}

/** Demo logins that at least name a role. */
export function parseDemoAccounts(value: unknown): DemoAccount[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const a = entry as Record<string, unknown> | null;
    if (!a || typeof a.role !== "string" || !a.role) return [];
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
    return [{ role: a.role, username: str(a.username), password: str(a.password), note: str(a.note) }];
  });
}

/** Database row → the shape the public components render. */
function toProject(p: ProjectRecord): Project {
  return {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    caseStudy: p.caseStudy ?? "",
    tech: p.tech,
    year: p.year ?? "",
    featured: p.featured,
    gradient: p.gradient ?? "from-primary via-accent-2 to-accent",
    image: p.image ?? undefined,
    screenshots: p.screenshots,
    icon: (p.icon as IconName) ?? "Sparkles",
    links: {
      demo: p.liveUrl ?? undefined,
      github: p.githubUrl ?? undefined,
    },
    metrics:
      Array.isArray(p.metrics) && p.metrics.length > 0
        ? (p.metrics as unknown as Metric[])
        : undefined,
    features: p.features,
    challenges: p.challenges ?? undefined,
    learnings: p.learnings ?? undefined,
    videoUrl: p.videoUrl ?? undefined,
    architectureImage: p.architectureImage ?? undefined,
    architectureNote: p.architectureNote ?? undefined,
    feedback: p.feedbackQuote
      ? {
          quote: p.feedbackQuote,
          author: p.feedbackAuthor ?? undefined,
          role: p.feedbackRole ?? undefined,
        }
      : null,
    seo: {
      title: p.metaTitle ?? undefined,
      description: p.metaDescription ?? undefined,
      ogImage: p.ogImage ?? undefined,
    },
    deck: parseDeck(p.deck),
    attachments: parseAttachments(p.attachments),
    demoAccounts: parseDemoAccounts(p.demoAccounts),
  };
}

/**
 * One published project by slug, or null when there genuinely isn't one.
 *
 * Deliberately does NOT swallow query errors: returning null for a failed
 * lookup would render a 404 for a project that exists, and during a build that
 * 404 is written to disk. A failure is raised instead, so it is visible.
 *
 * Wrapped in React's `cache` so the page and its `generateMetadata` share a
 * single query per request instead of running two.
 */
export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const row = await withRetry(() =>
    prisma.project.findFirst({ where: { slug, status: "PUBLISHED" } })
  );
  return row ? toProject(row) : null;
});

/** Published projects for the public site, DB-first with static fallback. */
export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const rows = await withRetry(() =>
      prisma.project.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    );

    return rows.map(toProject);
  } catch (err) {
    console.warn(
      "[data] getProjects: DB unavailable, using static fallback.",
      err instanceof Error ? err.message : err
    );
    return staticProjects;
  }
});

export type SiteCopyData = SiteCopyFormValues;

/**
 * Editable site copy (headings, hero stats, contact text, GitHub handle …).
 * Falls back to the copy the site shipped with until the row is first saved.
 */
export async function getSiteCopy(): Promise<SiteCopyData> {
  try {
    const row = await prisma.siteCopy.findUnique({ where: { id: "singleton" } });
    if (!row) return staticSiteCopy();
    const parsed = siteCopySchema.safeParse({
      heroStats: row.heroStats,
      sections: row.sections,
      aboutNote: row.aboutNote,
      techMarquee: row.techMarquee,
      achievements: row.achievements,
      contact: {
        eyebrow: row.contactEyebrow,
        title: row.contactTitle,
        description: row.contactDescription,
        responseTime: row.contactResponseTime,
      },
      githubUsername: row.githubUsername,
      miniProjects: row.miniProjects,
      navItems: row.navItems,
    });
    if (!parsed.success) {
      console.warn("[data] getSiteCopy: stored copy failed validation, using defaults.");
      return staticSiteCopy();
    }
    // Nav items saved before Contact became its own route still hold
    // "#contact"; point them at the live page rather than a dead anchor.
    return {
      ...parsed.data,
      navItems: parsed.data.navItems.map((item) => ({
        ...item,
        href: resolveNavTarget(item.href) as typeof item.href,
      })),
    };
  } catch {
    return staticSiteCopy();
  }
}

export type PostData = {
  title: string;
  slug: string;
  excerpt: string;
  tag: string | null;
  readingTime: string | null;
  /** ISO timestamp. */
  publishedAt: string;
  externalUrl: string | null;
  coverImage: string | null;
  content: string;
};

function toPostData(p: {
  title: string;
  slug: string;
  excerpt: string;
  tag: string | null;
  readingTime: string | null;
  publishedAt: Date;
  externalUrl: string | null;
  coverImage: string | null;
  content: string;
}): PostData {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    tag: p.tag,
    readingTime: p.readingTime,
    publishedAt: p.publishedAt.toISOString(),
    externalUrl: p.externalUrl,
    coverImage: p.coverImage,
    content: p.content,
  };
}

/** Published posts, newest first (manual order wins when set). */
export async function getPosts(): Promise<PostData[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    });
    return rows.map(toPostData);
  } catch {
    return [];
  }
}

/** One published post by slug, or null (drafts are invisible to the public). */
export async function getPost(slug: string): Promise<PostData | null> {
  try {
    const row = await prisma.post.findFirst({ where: { slug, status: "PUBLISHED" } });
    return row ? toPostData(row) : null;
  } catch {
    return null;
  }
}

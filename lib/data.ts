/**
 * Server-side data-access layer for the PUBLIC site.
 *
 * Reads live content from the database. If the DB is unreachable or empty
 * (e.g. before the first seed), it falls back to the static content in
 * content/site.ts so the site always renders. Once seeded, DB data wins.
 */
import { prisma } from "@/lib/prisma";
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
} from "@/content/site";
import type { IconName } from "@/components/icons";

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
  highlights: string[];
  tags: string[];
  icon: IconName;
};

export type EducationData = {
  institute: string;
  degree: string;
  duration: string;
  result: string | null;
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

export type SocialLinkData = { platform: string; url: string };

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
  resumeUrl: string | null;
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
  secondaryCtaHref: "#contact",
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
      subheadline: h.subheadline,
      location: h.location,
      availabilityOpen: h.availabilityOpen,
      availabilityLabel: h.availabilityLabel,
      email: h.email,
      resumeUrl: h.resumeUrl,
      heroImage: h.heroImage ?? "/jubair-portrait.jpg",
      primaryCtaLabel: h.primaryCtaLabel,
      primaryCtaHref: h.primaryCtaHref,
      secondaryCtaLabel: h.secondaryCtaLabel,
      secondaryCtaHref: h.secondaryCtaHref,
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
    if (cats.length === 0) throw new Error("empty");
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
    if (rows.length === 0) throw new Error("empty");
    return rows.map((e) => ({
      company: e.company,
      position: e.position,
      duration: e.duration,
      location: e.location,
      highlights: e.highlights,
      tags: e.tags,
      icon: e.icon as IconName,
    }));
  } catch {
    return staticExperience.map((e) => ({
      company: e.org,
      position: e.role,
      duration: e.period,
      location: e.location || null,
      highlights: [...e.highlights],
      tags: [...e.tags],
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
      icon: e.icon as IconName,
    }));
  } catch {
    return [
      {
        institute: "North South University",
        degree: "B.Sc. in Computer Science & Engineering",
        duration: "2021 — 2026",
        result: null,
        icon: "GraduationCap",
      },
    ];
  }
}

export async function getServices(): Promise<ServiceData[]> {
  try {
    const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) throw new Error("empty");
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
    if (rows.length === 0) throw new Error("empty");
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
    if (rows.length === 0) throw new Error("empty");
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
    resumeUrl: site.resumeUrl,
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
      resumeUrl: s.resumeUrl,
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
    if (rows.length === 0) throw new Error("empty");
    return rows.map((s) => ({ platform: s.platform, url: s.url }));
  } catch {
    return [
      { platform: "GitHub", url: site.socials.github },
      { platform: "LinkedIn", url: site.socials.linkedin },
      { platform: "Email", url: site.socials.email },
    ];
  }
}

/** Published projects for the public site, DB-first with static fallback. */
export async function getProjects(): Promise<Project[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) return staticProjects;

    return rows.map((p) => ({
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      caseStudy: p.caseStudy ?? "",
      tech: p.tech,
      year: p.year ?? "",
      featured: p.featured,
      gradient: p.gradient ?? "from-primary via-accent-2 to-accent",
      image: p.image ?? undefined,
      icon: (p.icon as IconName) ?? "Sparkles",
      links: {
        demo: p.liveUrl ?? undefined,
        github: p.githubUrl ?? undefined,
      },
      metrics: Array.isArray(p.metrics)
        ? (p.metrics as unknown as Metric[])
        : undefined,
    }));
  } catch (err) {
    console.warn(
      "[data] getProjects: DB unavailable, using static fallback.",
      err instanceof Error ? err.message : err
    );
    return staticProjects;
  }
}

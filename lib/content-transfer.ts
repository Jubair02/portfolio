/**
 * Content backup & restore.
 *
 * Exports every editable content table as one JSON document and restores such
 * a document in a single transaction. Users, contact messages, media records,
 * the activity log and rate-limit counters are deliberately excluded: they are
 * operational data, not content, and a restore should never touch them.
 */
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const EXPORT_FORMAT = "portfolio-content";
export const EXPORT_VERSION = 1;

const row = z.looseObject({});
const rows = z.array(row);

export const contentBackupSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  version: z.literal(EXPORT_VERSION),
  exportedAt: z.string().optional(),
  data: z.object({
    hero: row.nullable(),
    about: row.extend({ values: rows }).nullable(),
    seoSettings: row.nullable(),
    siteSettings: row.nullable(),
    siteCopy: row.nullable(),
    skillCategories: z.array(row.extend({ skills: rows })),
    projects: rows,
    experience: rows,
    education: rows,
    certificates: rows,
    services: rows,
    testimonials: rows,
    socialLinks: rows,
  }),
});
export type ContentBackup = z.infer<typeof contentBackupSchema>;

function omit(r: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...r };
  for (const k of keys) delete copy[k];
  return copy;
}

/** Drop fields the database generates so imported rows get fresh values. */
function stripMeta(r: Record<string, unknown>): Record<string, unknown> {
  return omit(r, ["id", "createdAt", "updatedAt"]);
}

/** Prisma needs an explicit marker to write SQL NULL into a Json column. */
function json(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === null || value === undefined ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

export async function buildContentBackup(): Promise<ContentBackup> {
  const [
    hero,
    about,
    seoSettings,
    siteSettings,
    siteCopy,
    skillCategories,
    projects,
    experience,
    education,
    certificates,
    services,
    testimonials,
    socialLinks,
  ] = await Promise.all([
    prisma.hero.findUnique({ where: { id: "singleton" } }),
    prisma.about.findUnique({
      where: { id: "singleton" },
      include: { values: { orderBy: { order: "asc" } } },
    }),
    prisma.seoSettings.findUnique({ where: { id: "singleton" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.siteCopy.findUnique({ where: { id: "singleton" } }),
    prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    }),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.certificate.findMany({ orderBy: { order: "asc" } }),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      hero,
      about,
      seoSettings,
      siteSettings,
      siteCopy,
      skillCategories,
      projects,
      experience,
      education,
      certificates,
      services,
      testimonials,
      socialLinks,
    },
  } as ContentBackup;
}

/**
 * Replace all content with the backup. Runs in one transaction, so a bad file
 * leaves the database exactly as it was. Throws on failure.
 */
export async function restoreContentBackup(backup: ContentBackup): Promise<void> {
  const d = backup.data;

  await prisma.$transaction(
    async (tx) => {
      // Collections: wipe and recreate in the saved order.
      await tx.skill.deleteMany();
      await tx.skillCategory.deleteMany();
      await tx.aboutValue.deleteMany();
      await tx.project.deleteMany();
      await tx.experience.deleteMany();
      await tx.education.deleteMany();
      await tx.certificate.deleteMany();
      await tx.service.deleteMany();
      await tx.testimonial.deleteMany();
      await tx.socialLink.deleteMany();

      for (const cat of d.skillCategories) {
        const { skills, ...rest } = cat;
        await tx.skillCategory.create({
          data: {
            ...(stripMeta(rest) as Prisma.SkillCategoryCreateInput),
            skills: {
              create: skills.map((s) => {
                return omit(stripMeta(s), ["categoryId"]) as Prisma.SkillCreateWithoutCategoryInput;
              }),
            },
          },
        });
      }

      if (d.projects.length) {
        await tx.project.createMany({
          data: d.projects.map((p) => ({
            ...(stripMeta(p) as Prisma.ProjectCreateManyInput),
            metrics: json(p.metrics),
          })),
        });
      }
      if (d.experience.length)
        await tx.experience.createMany({ data: d.experience.map(stripMeta) as Prisma.ExperienceCreateManyInput[] });
      if (d.education.length)
        await tx.education.createMany({ data: d.education.map(stripMeta) as Prisma.EducationCreateManyInput[] });
      if (d.certificates.length)
        await tx.certificate.createMany({ data: d.certificates.map(stripMeta) as Prisma.CertificateCreateManyInput[] });
      if (d.services.length)
        await tx.service.createMany({ data: d.services.map(stripMeta) as Prisma.ServiceCreateManyInput[] });
      if (d.testimonials.length)
        await tx.testimonial.createMany({ data: d.testimonials.map(stripMeta) as Prisma.TestimonialCreateManyInput[] });
      if (d.socialLinks.length)
        await tx.socialLink.createMany({ data: d.socialLinks.map(stripMeta) as Prisma.SocialLinkCreateManyInput[] });

      // Singletons: upsert so a backup taken before a row existed still applies.
      if (d.hero) {
        const data = stripMeta(d.hero) as Prisma.HeroUncheckedCreateInput;
        await tx.hero.upsert({ where: { id: "singleton" }, update: data, create: { ...data, id: "singleton" } });
      }
      if (d.about) {
        const { values, ...rest } = d.about;
        const data = stripMeta(rest) as Prisma.AboutUncheckedCreateInput;
        await tx.about.upsert({ where: { id: "singleton" }, update: data, create: { ...data, id: "singleton" } });
        if (values.length) {
          await tx.aboutValue.createMany({
            data: values.map((v) => {
              const value = omit(stripMeta(v), ["aboutId"]) as Prisma.AboutValueCreateManyInput;
              return { ...value, aboutId: "singleton" };
            }),
          });
        }
      }
      if (d.seoSettings) {
        const data = stripMeta(d.seoSettings) as Prisma.SeoSettingsUncheckedCreateInput;
        await tx.seoSettings.upsert({ where: { id: "singleton" }, update: data, create: { ...data, id: "singleton" } });
      }
      if (d.siteSettings) {
        const data = stripMeta(d.siteSettings) as Prisma.SiteSettingsUncheckedCreateInput;
        await tx.siteSettings.upsert({ where: { id: "singleton" }, update: data, create: { ...data, id: "singleton" } });
      }
      if (d.siteCopy) {
        const raw = stripMeta(d.siteCopy);
        const data = {
          ...raw,
          heroStats: json(raw.heroStats),
          sections: json(raw.sections),
          achievements: json(raw.achievements),
          miniProjects: json(raw.miniProjects),
          navItems: json(raw.navItems),
        } as Prisma.SiteCopyUncheckedCreateInput;
        await tx.siteCopy.upsert({ where: { id: "singleton" }, update: data, create: { ...data, id: "singleton" } });
      }
    },
    { timeout: 30_000 }
  );
}

/** Rough size of a backup for the UI. */
export function summarize(backup: ContentBackup): Record<string, number> {
  const d = backup.data;
  return {
    projects: d.projects.length,
    skills: d.skillCategories.reduce((n, c) => n + c.skills.length, 0),
    experience: d.experience.length,
    education: d.education.length,
    certificates: d.certificates.length,
    services: d.services.length,
    testimonials: d.testimonials.length,
    socialLinks: d.socialLinks.length,
  };
}

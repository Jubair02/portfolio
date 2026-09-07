/**
 * Baseline seed — migrates the original content/site.ts data into the database
 * and creates the FIRST admin user (only when no user exists at all).
 *
 * ⚠ Re-running REPLACES the content collections and singletons below — any
 * edits made in the admin panel are overwritten. Treat it as a one-off
 * bootstrap, not a routine command. User, ContactMessage, MediaAsset and
 * ActivityLog are left untouched.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  site,
  about,
  skillCategories,
  projects,
  services,
  certifications,
  testimonials,
} from "../content/site";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  // --- Admin user (first run only) ----------------------------------------
  // This used to upsert by ADMIN_EMAIL. Once the admin changed their email in
  // the Profile page, that upsert no longer matched the real account, so a
  // re-run silently CREATED a second admin with whatever password was sitting
  // in .env. Bootstrap the very first user only; after that, accounts are
  // managed from the admin panel.
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log(
      `↷ Skipping admin creation — ${userCount} user(s) already exist. ` +
        `Manage accounts from the admin Profile page.`
    );
  } else {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? "Site Admin";
    if (!email || !password) {
      throw new Error(
        "No users exist yet and ADMIN_EMAIL / ADMIN_PASSWORD are not set. " +
          "Set them to create the first admin user (no default is used)."
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, name, passwordHash } });
    console.log(`✔ First admin user created: ${email}`);
  }

  // --- Clear content (keep users / messages / media / activity) -----------
  await prisma.$transaction([
    prisma.skill.deleteMany(),
    prisma.skillCategory.deleteMany(),
    prisma.aboutValue.deleteMany(),
    prisma.project.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.education.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.service.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.socialLink.deleteMany(),
  ]);

  // --- Hero ----------------------------------------------------------------
  await prisma.hero.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
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
    },
  });

  // --- About + values ------------------------------------------------------
  await prisma.about.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      eyebrow: about.eyebrow,
      title: about.title,
      paragraphs: [...about.paragraphs],
      yearsOfExperience: 3,
      education: "B.Sc. in Computer Science & Engineering",
      location: site.location,
      resumeUrl: site.resumeUrl,
      values: {
        create: about.values.map((v, i) => ({
          icon: v.icon,
          title: v.title,
          description: v.description,
          order: i,
        })),
      },
    },
  });

  // --- Skills --------------------------------------------------------------
  for (const [i, cat] of skillCategories.entries()) {
    await prisma.skillCategory.create({
      data: {
        icon: cat.icon,
        title: cat.title,
        blurb: cat.blurb,
        order: i,
        skills: {
          create: cat.skills.map((s, j) => ({
            name: s.name,
            level: s.level,
            order: j,
          })),
        },
      },
    });
  }

  // --- Projects ------------------------------------------------------------
  await prisma.project.createMany({
    data: projects.map((p, i) => ({
      title: p.title,
      slug: slugify(p.title),
      tagline: p.tagline,
      description: p.description,
      caseStudy: p.caseStudy,
      tech: [...p.tech],
      year: p.year,
      featured: p.featured,
      status: ProjectStatus.PUBLISHED,
      gradient: p.gradient,
      icon: p.icon,
      image: p.image ?? null,
      githubUrl: p.links.github ?? null,
      liveUrl: p.links.demo ?? null,
      metrics: p.metrics ? p.metrics.map((m) => ({ ...m })) : undefined,
      order: i,
    })),
  });

  // --- Experience (work history) ------------------------------------------
  await prisma.experience.createMany({
    data: [
      {
        company: "Tulip Tech",
        position: "Trainee Associate Software Engineer",
        duration: "2026 — Present",
        location: "On site",
        description:
          "Design, build and deploy full-stack web apps with React, Next.js and .NET.",
        highlights: [
          "Design, build and deploy full-stack web apps with React, Next.js and .NET.",
          "Shipped 20+ projects spanning e-learning, e-commerce and internal tooling.",
          "Own the entire lifecycle: UI/UX, API design, deployment and iteration.",
        ],
        tags: ["React", "Next.js", ".NET", "Vercel"],
        icon: "Briefcase",
        order: 0,
      },
      {
        company: "Bengal Software",
        position: "Frontend Developer",
        duration: "2026 January — 2026 April",
        location: "On site",
        description: "Built responsive, accessible interfaces from Figma designs.",
        highlights: [
          "Built responsive, accessible interfaces from Figma designs.",
          "Focused on performance budgets and Core Web Vitals.",
          "Collaborated using Git-based workflows and code review.",
        ],
        tags: ["JavaScript", "React", "Tailwind CSS"],
        icon: "Code2",
        order: 1,
      },
    ],
  });

  // --- Education -----------------------------------------------------------
  await prisma.education.createMany({
    data: [
      {
        institute: "North South University",
        degree: "B.Sc. in Computer Science & Engineering",
        duration: "2021 — 2026",
        result: null,
        icon: "GraduationCap",
        order: 0,
      },
    ],
  });

  // --- Certificates --------------------------------------------------------
  await prisma.certificate.createMany({
    data: certifications.map((c, i) => ({
      title: c.title,
      organization: c.issuer,
      date: c.year,
      icon: c.icon,
      order: i,
    })),
  });

  // --- Services ------------------------------------------------------------
  await prisma.service.createMany({
    data: services.map((s, i) => ({
      icon: s.icon,
      title: s.title,
      description: s.description,
      features: [...s.features],
      order: i,
    })),
  });

  // --- Testimonials --------------------------------------------------------
  await prisma.testimonial.createMany({
    data: testimonials.map((t, i) => ({
      name: t.name,
      designation: t.title,
      company: t.company,
      review: t.quote,
      rating: 5,
      initials: t.initials,
      order: i,
    })),
  });

  // --- Social links --------------------------------------------------------
  await prisma.socialLink.createMany({
    data: [
      { platform: "GitHub", url: site.socials.github, icon: "GitBranch", order: 0 },
      { platform: "LinkedIn", url: site.socials.linkedin, icon: "Code2", order: 1 },
      { platform: "Email", url: site.socials.email, icon: "Sparkles", order: 2 },
    ],
  });

  // --- SEO settings --------------------------------------------------------
  await prisma.seoSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteTitle: `${site.name} — ${site.role}`,
      metaDescription: site.subheadline,
      keywords: [
        site.name,
        "Full-Stack Developer",
        "React Developer",
        "Next.js Developer",
        ".NET Developer",
        "Web Developer Portfolio",
        "TypeScript",
      ],
    },
  });

  // --- Site settings -------------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      footerText: `Designed & built by ${site.name}.`,
      copyright: `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`,
      resumeUrl: site.resumeUrl,
      primaryColor: "#6d5efc",
      accentColor: "#0891b2",
      siteUrl: site.url,
    },
  });

  console.log("✔ Portfolio content seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

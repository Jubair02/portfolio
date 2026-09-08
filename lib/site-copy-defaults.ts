import {
  nav,
  stats,
  techMarquee,
  achievements,
  contact,
  github,
  miniProjects,
} from "@/content/site";
import type { IconName } from "@/lib/icon-names";
import type { SiteCopyFormValues } from "@/lib/schemas/site-copy";

/**
 * The copy the site shipped with, used as the fallback when the SiteCopy row
 * does not exist yet (fresh database) or the database is unreachable, and as
 * the seed. Once the admin saves the Site Copy form, the database wins.
 */
export function staticSiteCopy(): SiteCopyFormValues {
  return {
    heroStats: stats.map((s) => ({ label: s.label, value: s.value, suffix: s.suffix })),
    sections: {
      skills: {
        eyebrow: "Skills",
        title: "A modern, full-stack toolkit",
        description:
          "Battle-tested technologies I use to design, build, and ship products end to end.",
      },
      projects: {
        eyebrow: "Selected work",
        title: "Projects I'm proud of",
        description:
          "A selection of things I've designed and built — from responsive front-ends to .NET APIs. Each one taught me something new.",
      },
      experience: {
        eyebrow: "Journey",
        title: "Experience & education",
        description:
          "The path so far — a mix of building in the open, client work, and formal study.",
      },
      services: {
        eyebrow: "Services",
        title: "How I can help",
        description:
          "Whether you're a founder validating an idea or a team that needs an extra pair of expert hands — here's what I bring to the table.",
      },
      certifications: {
        eyebrow: "Credentials",
        title: "Certifications & achievements",
        description:
          "Continuous learning is part of the job. Here are a few milestones along the way.",
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "Kind words from people I've worked with",
        description: "",
      },
      github: {
        eyebrow: "Open source",
        title: "Building in public",
        description:
          "A snapshot of my GitHub — where I experiment, learn, and ship. Numbers straight from the source.",
      },
      blog: {
        eyebrow: "Writing",
        title: "Insights & notes",
        description:
          "Occasional write-ups on things I learn while building. Ideas, patterns, and lessons from the trenches.",
      },
    },
    aboutNote:
      "Currently sharpening my skills in **system design**, **TypeScript** and **cloud deployment** — always learning, always building.",
    techMarquee: [...techMarquee],
    achievements: achievements.map((a) => ({
      icon: a.icon as IconName,
      label: a.label,
      metric: a.metric,
    })),
    contact: {
      eyebrow: contact.eyebrow,
      title: contact.title,
      description: contact.description,
      responseTime: contact.responseTime,
    },
    githubUsername: github.username,
    miniProjects: miniProjects.map((m) => ({ title: m.title, tech: m.tech, href: m.href })),
    navItems: nav.map((n) => ({ label: n.label, href: n.href })),
  };
}

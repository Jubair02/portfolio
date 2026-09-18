import { z } from "zod";
import { iconNameSchema } from "@/lib/schemas/icon";
import { httpUrlSchema } from "@/lib/schemas/url";

/**
 * "Site Copy" — every piece of public text that used to be hardcoded in
 * content/site.ts: the hero stats strip, each section's heading, the About
 * note, the skills marquee, the "By the numbers" panel, the contact copy and
 * the GitHub username / mini-project links. One singleton row, edited from
 * Admin → Site Copy.
 */

const required = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const sectionCopySchema = z.object({
  eyebrow: required("Eyebrow"),
  title: required("Title"),
  description: z.string().trim().optional(),
});
export type SectionCopy = z.infer<typeof sectionCopySchema>;

/** Public sections whose heading is editable, in page order. */
export const SECTION_KEYS = [
  "skills",
  "projects",
  "experience",
  "services",
  "certifications",
  "testimonials",
  "github",
  "blog",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  skills: "Skills",
  projects: "Projects",
  experience: "Experience & education",
  services: "Services",
  certifications: "Certifications",
  testimonials: "Testimonials",
  github: "GitHub",
  blog: "Blog",
};

export const heroStatSchema = z.object({
  label: required("Label"),
  value: z.number({ error: "Enter a number." }).min(0, "Use a positive number."),
  /** "+", "%", "k" … shown right after the number. */
  suffix: z.string().trim().max(4, "Keep the suffix short."),
});
export type HeroStat = z.infer<typeof heroStatSchema>;

export const achievementSchema = z.object({
  icon: iconNameSchema,
  label: required("Label"),
  metric: required("Metric"),
});
export type Achievement = z.infer<typeof achievementSchema>;

export const miniProjectSchema = z.object({
  title: required("Title"),
  tech: z.string().trim(),
  href: httpUrlSchema,
});
export type MiniProject = z.infer<typeof miniProjectSchema>;

/** Section ids that exist on the home page — the only valid nav targets. */
export const SECTION_ANCHORS = [
  "#about",
  "#skills",
  "#work",
  "#experience",
  "#services",
  "#certifications",
  "#testimonials",
  "#github",
  "#blog",
] as const;

/**
 * Anchors that no longer exist on the home page.
 *
 * Contact moved to its own route, so "#contact" scrolls nowhere. It stays a
 * *valid* value because `getSiteCopy` falls back to the entire shipped copy
 * when parsing fails — dropping it from the enum would make one stale nav row
 * silently discard every other saved heading. Stored values are rewritten to
 * the real route on read instead; see `resolveNavTarget` in lib/nav.ts.
 */
export const RETIRED_ANCHORS = ["#contact"] as const;

export type SectionAnchor =
  | (typeof SECTION_ANCHORS)[number]
  | (typeof RETIRED_ANCHORS)[number];

export const ANCHOR_LABELS: Record<SectionAnchor, string> = {
  "#about": "About",
  "#skills": "Skills",
  "#work": "Projects",
  "#experience": "Experience",
  "#services": "Services",
  "#certifications": "Certifications",
  "#testimonials": "Testimonials",
  "#github": "GitHub",
  "#blog": "Blog",
  "#contact": "Contact",
};

/** Real routes a nav item may point at, alongside the on-page sections. */
export const PAGE_ROUTES = ["/projects", "/contact"] as const;
export type PageRoute = (typeof PAGE_ROUTES)[number];

export type NavTarget = SectionAnchor | PageRoute;

/** Everything that parses, including anchors kept only for stored rows. */
export const NAV_TARGETS = [
  ...SECTION_ANCHORS,
  ...RETIRED_ANCHORS,
  ...PAGE_ROUTES,
] as [NavTarget, ...NavTarget[]];

/** What the admin picker offers — live targets only, so no dead anchors. */
export const NAV_PICKER_TARGETS = [...SECTION_ANCHORS, ...PAGE_ROUTES] as const;

export const NAV_TARGET_LABELS: Record<NavTarget, string> = {
  ...ANCHOR_LABELS,
  "/projects": "All projects (page)",
  "/contact": "Contact (page)",
};

export const navItemSchema = z.object({
  label: required("Label").pipe(z.string().max(24, "Keep labels short.")),
  href: z.enum(NAV_TARGETS, { message: "Pick a section or page." }),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const contactCopySchema = z.object({
  eyebrow: required("Eyebrow"),
  title: required("Title"),
  description: required("Description"),
  responseTime: required("Response time"),
});
export type ContactCopy = z.infer<typeof contactCopySchema>;

/** GitHub's own rule: 1–39 chars, alphanumeric or single hyphens, no leading/trailing hyphen. */
const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export const siteCopySchema = z.object({
  heroStats: z
    .array(heroStatSchema)
    .min(1, "Add at least one stat.")
    .max(6, "Keep it to six stats — the strip has room for four per row."),
  sections: z.object({
    skills: sectionCopySchema,
    projects: sectionCopySchema,
    experience: sectionCopySchema,
    services: sectionCopySchema,
    certifications: sectionCopySchema,
    testimonials: sectionCopySchema,
    github: sectionCopySchema,
    blog: sectionCopySchema,
  }),
  /** Short "what I'm learning" note under the About values. Supports **bold**. Empty hides it. */
  aboutNote: z.string().trim(),
  techMarquee: z.array(z.string().trim().min(1)),
  achievements: z.array(achievementSchema).max(8, "Keep it to eight entries."),
  contact: contactCopySchema,
  githubUsername: z.string().trim().regex(GITHUB_USERNAME, "Enter a valid GitHub username."),
  miniProjects: z.array(miniProjectSchema).max(8, "Keep it to eight links."),
  /** Header, footer and 404 navigation. Empty hides the links (the logo still works). */
  navItems: z.array(navItemSchema).max(8, "Keep it to eight links — the header runs out of room."),
});
export type SiteCopyFormValues = z.infer<typeof siteCopySchema>;

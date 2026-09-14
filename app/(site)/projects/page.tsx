import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjects, getSiteCopy } from "@/lib/data";
import { getGitHubProfile } from "@/lib/github";
import { Eyebrow } from "@/components/ui/Section";
import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { GithubIcon } from "@/components/icons";

// Same cadence as the home page; project saves also revalidate this path.
export const revalidate = 60;

const DESCRIPTION =
  "Every published project — responsive front-ends, full-stack apps and .NET APIs, with the build notes behind each one.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: "/projects" },
  // Without its own block the page would inherit the home page's Open Graph
  // tags, so a shared /projects link previewed as the home page.
  openGraph: {
    type: "website",
    title: "Projects",
    description: DESCRIPTION,
    url: "/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: DESCRIPTION,
  },
};

/**
 * The full catalogue. The landing page shows only Featured projects; every
 * project with status PUBLISHED appears here regardless of the Featured flag.
 */
export default async function ProjectsPage() {
  const [projects, copy] = await Promise.all([getProjects(), getSiteCopy()]);
  const github = await getGitHubProfile(copy.githubUsername);
  const heading = copy.sections.projects;
  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div className="container-page pb-24 pt-32 sm:pt-36">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>

      <header className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            All projects
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {projects.length === 0
              ? "Nothing published yet — check back soon."
              : `${projects.length} project${projects.length === 1 ? "" : "s"}${
                  featuredCount ? `, ${featuredCount} featured on the home page` : ""
                }. ${heading.description ?? ""}`}
          </p>
        </div>
        <a
          href={github.url}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--primary)]/50"
        >
          <GithubIcon className="size-4" />
          View all on GitHub
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </header>

      {projects.length > 0 && <ProjectsExplorer projects={projects} />}
    </div>
  );
}

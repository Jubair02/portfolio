import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjects, getSiteCopy } from "@/lib/data";
import { getGitHubProfile } from "@/lib/github";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { GithubIcon } from "@/components/icons";

// Same cadence as the home page; project saves also revalidate this path.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Every published project — front-ends, full-stack apps and .NET APIs.",
  alternates: { canonical: "/projects" },
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

      {projects.length > 0 && (
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={0.05 * (i % 3)} amount={0.15} className="min-w-0">
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

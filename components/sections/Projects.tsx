import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Project } from "@/content/site";
import { Button } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { GithubIcon } from "@/components/icons";

/**
 * Landing-page teaser: only projects marked Featured. The complete list of
 * published projects lives at /projects, so the home page stays uncluttered
 * as the catalogue grows.
 */
export function Projects({
  projects,
  totalPublished,
  heading,
  githubUrl,
}: {
  /** Featured, published projects in display order. */
  projects: Project[];
  /** Count of every published project (featured or not) — drives the CTA copy. */
  totalPublished: number;
  heading: SectionCopy;
  githubUrl: string;
}) {
  // Nothing published at all — hide the section rather than render a bare heading.
  if (totalPublished === 0) return null;
  return (
    <Section id="work" className="border-t border-[color:var(--border)]">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          description={heading.description}
        />
        <Reveal delay={0.1}>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--primary)]/50"
          >
            <GithubIcon className="size-4" />
            View all on GitHub
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>
      </div>

      {projects.length > 0 ? (
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[repeat(2,minmax(0,1fr))]">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={0.06 * (i % 2)} amount={0.15} className="min-w-0">
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <p className="mt-14 text-sm text-muted-foreground">
            No project is marked as featured yet — the full list is one click away.
          </p>
        </Reveal>
      )}

      {/* Hand-off to the full catalogue */}
      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Button href="/projects" variant="secondary" size="lg">
            See more projects
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            {projects.length < totalPublished
              ? `${totalPublished - projects.length} more published project${
                  totalPublished - projects.length === 1 ? "" : "s"
                } on the full list.`
              : "Browse the full list with details and links."}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

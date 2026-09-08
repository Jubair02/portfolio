import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/site";
import type { SectionCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { GithubIcon } from "@/components/icons";

export function Projects({
  projects,
  heading,
  githubUrl,
}: {
  projects: Project[];
  heading: SectionCopy;
  githubUrl: string;
}) {
  // Nothing published — hide the section rather than render a bare heading.
  if (projects.length === 0) return null;
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

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.title} delay={0.06 * (i % 2)} amount={0.15}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

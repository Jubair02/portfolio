import { ArrowUpRight } from "lucide-react";
import { site, type Project } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { GithubIcon } from "@/components/icons";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <Section id="work" className="border-t border-[color:var(--border)]">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Selected work"
          title="Projects I'm proud of"
          description="A selection of things I've designed and built — from responsive front-ends to .NET APIs. Each one taught me something new."
        />
        <Reveal delay={0.1}>
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color:var(--primary)]/50"
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

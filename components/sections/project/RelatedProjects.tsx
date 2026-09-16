import type { Project } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/sections/ProjectCard";

/**
 * Up to three other projects, ranked by how many technologies they share with
 * the one being read. When nothing overlaps the heading changes rather than
 * calling unrelated work "related".
 */
export function RelatedProjects({
  projects,
  current,
}: {
  /** Every published project, in curated order. */
  projects: Project[];
  current: Project;
}) {
  const currentTech = new Set(current.tech.map((t) => t.toLowerCase()));
  const ranked = projects
    .filter((p) => p.slug !== current.slug)
    .map((project) => ({
      project,
      shared: project.tech.filter((t) => currentTech.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.shared - a.shared);

  const overlapping = ranked.filter((entry) => entry.shared > 0).slice(0, 3);
  const shown = overlapping.length > 0 ? overlapping : ranked.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[color:var(--border)] pt-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        {overlapping.length > 0 ? "Related projects" : "More projects"}
      </h2>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[repeat(3,minmax(0,1fr))]">
        {shown.map(({ project }, i) => (
          <Reveal key={project.slug ?? project.title} delay={0.05 * i} amount={0.15} className="min-w-0">
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

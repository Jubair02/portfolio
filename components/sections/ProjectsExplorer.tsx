"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Project } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";

type Sort = "default" | "featured" | "az";

const SORTS: { value: Sort; label: string }[] = [
  { value: "default", label: "Curated order" },
  { value: "featured", label: "Featured first" },
  { value: "az", label: "A – Z" },
];

const control =
  "min-w-0 flex-1 truncate rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-4 py-2 text-sm font-medium text-foreground/85 outline-none transition-colors hover:border-[color:var(--primary)]/50 focus-visible:border-[color:var(--primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/30 sm:flex-none sm:max-w-[16rem]";

/** Label + control pair: its own row on phones, inline from sm up. */
const field = "flex w-full min-w-0 items-center gap-2 sm:w-auto";

/**
 * The full catalogue with client-side filtering. Kept on the client so a
 * filter change is instant and the page itself stays statically rendered;
 * "Curated order" is the order set by drag-and-drop in the admin.
 */
export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [tech, setTech] = useState("all");
  const [sort, setSort] = useState<Sort>("default");

  // Every technology used, most common first, with a count for the label.
  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.tech) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);

  const shown = useMemo(() => {
    const list = tech === "all" ? projects : projects.filter((p) => p.tech.includes(tech));
    if (sort === "featured") {
      // Array.prototype.sort is stable, so ties keep the curated order.
      return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [projects, tech, sort]);

  const filtering = tech !== "all" || sort !== "default";

  return (
    <div className="mt-12">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-[color:var(--border)] py-4">
        <div className={field}>
          <label htmlFor="tech-filter" className="text-sm text-muted-foreground">
            Technology
          </label>
          <select
            id="tech-filter"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            className={control}
          >
            <option value="all">All ({projects.length})</option>
            {technologies.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </div>

        <div className={field}>
          <label htmlFor="sort-order" className="text-sm text-muted-foreground">
            Sort
          </label>
          <select
            id="sort-order"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={control}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-muted-foreground sm:ml-auto" aria-live="polite">
          Showing {shown.length} of {projects.length}
        </p>

        {filtering && (
          <button
            type="button"
            onClick={() => {
              setTech("all");
              setSort("default");
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No project uses <span className="font-medium text-foreground">{tech}</span> yet.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          {shown.map((project, i) => (
            <Reveal key={project.title} delay={0.05 * (i % 3)} amount={0.15} className="min-w-0">
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

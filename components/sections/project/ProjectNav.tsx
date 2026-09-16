import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Project } from "@/content/site";

function NavLink({
  project,
  direction,
}: {
  project: Project;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/projects/${project.slug}`}
      rel={isNext ? "next" : "prev"}
      className="card-hover surface group flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-4 hover:border-[color:var(--primary)]/40"
    >
      {!isNext && (
        <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
      )}
      <span className={`min-w-0 flex-1 ${isNext ? "text-right" : ""}`}>
        <span className="block text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {isNext ? "Next" : "Previous"}
        </span>
        <span className="mt-0.5 block truncate text-sm font-medium">{project.title}</span>
      </span>
      {isNext && (
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

/** Move through the catalogue in the order set in the admin. */
export function ProjectNav({
  previous,
  next,
}: {
  previous?: Project;
  next?: Project;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="More projects"
      className="mt-10 flex flex-col gap-3 sm:flex-row"
    >
      {previous ? <NavLink project={previous} direction="previous" /> : <span className="flex-1" />}
      {next ? <NavLink project={next} direction="next" /> : <span className="flex-1" />}
    </nav>
  );
}

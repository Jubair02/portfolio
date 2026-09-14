import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/admin/ui/button";
import { ProjectsList, type ProjectRow } from "@/components/admin/projects/ProjectsList";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Rendered on the server so the label can't disagree with the client clock. */
function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

async function getRows(): Promise<ProjectRow[]> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      tagline: p.tagline,
      status: p.status as "DRAFT" | "PUBLISHED",
      featured: p.featured,
      order: p.order,
      image: p.image,
      icon: p.icon,
      tech: p.tech,
      year: p.year,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      updatedAt: p.updatedAt.toISOString(),
      updatedLabel: timeAgo(p.updatedAt),
    }));
  } catch {
    return [];
  }
}

function Tally({
  value,
  label,
  dotClass,
}: {
  value: number;
  label: string;
  dotClass: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", dotClass)} />
      <span className="font-medium tabular-nums text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

export default async function ProjectsPage() {
  const rows = await getRows();
  const published = rows.filter((p) => p.status === "PUBLISHED").length;
  const drafts = rows.length - published;
  const featured = rows.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          {rows.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <Tally value={published} label="published" dotClass="bg-emerald-500" />
              <Tally value={drafts} label="in draft" dotClass="bg-muted-foreground/50" />
              <Tally value={featured} label="featured" dotClass="bg-gold" />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Everything the portfolio shows as work lives here.
            </p>
          )}
        </div>

        <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </header>

      <ProjectsList projects={rows} />
    </div>
  );
}

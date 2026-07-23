import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/admin/ui/button";
import { ProjectsTable, type ProjectRow } from "@/components/admin/projects/ProjectsTable";

export const dynamic = "force-dynamic";

async function getRows(): Promise<ProjectRow[]> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline,
      status: p.status as "DRAFT" | "PUBLISHED",
      featured: p.featured,
      order: p.order,
      image: p.image,
      tech: p.tech,
    }));
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const rows = await getRows();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} project{rows.length === 1 ? "" : "s"} · manage your portfolio work.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            New project
          </Link>
        </Button>
      </div>

      <ProjectsTable projects={rows} />
    </div>
  );
}

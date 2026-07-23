import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import type { ProjectFormValues } from "@/lib/schemas/project";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) notFound();

  const initial: ProjectFormValues = {
    title: p.title,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    caseStudy: p.caseStudy ?? "",
    tech: p.tech,
    category: p.category ?? "",
    year: p.year ?? "",
    featured: p.featured,
    status: p.status as "DRAFT" | "PUBLISHED",
    gradient: p.gradient ?? "",
    icon: p.icon,
    image: p.image ?? "",
    screenshots: p.screenshots,
    githubUrl: p.githubUrl ?? "",
    liveUrl: p.liveUrl ?? "",
    order: p.order,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit project</h1>
        <p className="text-sm text-muted-foreground">{p.title}</p>
      </div>
      <ProjectForm mode="edit" id={p.id} initial={initial} />
    </div>
  );
}

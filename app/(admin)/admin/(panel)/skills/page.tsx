import { prisma } from "@/lib/prisma";
import { SkillsManager } from "@/components/admin/skills/SkillsManager";
import { PageHeader } from "@/components/admin/Field";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    const cats = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    });
    return cats.map((c) => ({
      id: c.id,
      icon: c.icon,
      title: c.title,
      blurb: c.blurb,
      skills: c.skills.map((s) => ({ id: s.id, name: s.name, level: s.level })),
    }));
  } catch {
    return [];
  }
}

export default async function SkillsAdminPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <PageHeader title="Skills" description="Categories, skills, and their order (drag to reorder)." />
      <SkillsManager categories={categories} />
    </div>
  );
}

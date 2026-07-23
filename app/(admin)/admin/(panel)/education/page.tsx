import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createEducation, updateEducation, deleteEducation } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "degree", label: "Degree", type: "text" },
  { name: "institute", label: "Institute", type: "text" },
  { name: "duration", label: "Duration", type: "text", placeholder: "2021 — 2026" },
  { name: "result", label: "Result / GPA", type: "text" },
  { name: "icon", label: "Icon", type: "text", hint: "Lucide icon (e.g. GraduationCap)" },
  { name: "logo", label: "Logo", type: "image", folder: "portfolio/education" },
];

async function getItems() {
  try {
    const rows = await prisma.education.findMany({ orderBy: { order: "asc" } });
    return rows.map((e) => ({
      id: e.id,
      institute: e.institute,
      degree: e.degree,
      duration: e.duration,
      result: e.result ?? "",
      logo: e.logo ?? "",
      icon: e.icon,
    }));
  } catch {
    return [];
  }
}

export default async function EducationAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Education" description="Your academic background." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="degree"
        subtitleKey="institute"
        iconKey="icon"
        addLabel="Add education"
        create={createEducation}
        update={updateEducation}
        remove={deleteEducation}
      />
    </div>
  );
}

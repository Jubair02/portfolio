import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "position", label: "Position", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "duration", label: "Duration", type: "text", placeholder: "2024 — Present" },
  { name: "location", label: "Location", type: "text" },
  { name: "icon", label: "Icon", type: "text", hint: "Lucide icon (e.g. Briefcase, Code2)" },
  { name: "logo", label: "Company logo", type: "image", folder: "portfolio/experience" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "highlights", label: "Highlights", type: "tags", hint: "Press Enter after each point." },
  { name: "tags", label: "Tags / skills", type: "tags" },
];

async function getItems() {
  try {
    const rows = await prisma.experience.findMany({ orderBy: { order: "asc" } });
    return rows.map((e) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      duration: e.duration,
      location: e.location ?? "",
      description: e.description ?? "",
      highlights: e.highlights,
      tags: e.tags,
      logo: e.logo ?? "",
      icon: e.icon,
    }));
  } catch {
    return [];
  }
}

export default async function ExperienceAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Experience" description="Your work history timeline." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="position"
        subtitleKey="company"
        iconKey="icon"
        addLabel="Add experience"
        create={createExperience}
        update={updateExperience}
        remove={deleteExperience}
      />
    </div>
  );
}

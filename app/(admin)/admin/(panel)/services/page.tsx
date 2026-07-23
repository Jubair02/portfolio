import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createService, updateService, deleteService } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "icon", label: "Icon", type: "text", hint: "Lucide icon (e.g. Server, Palette)" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "features", label: "Features", type: "tags", hint: "Press Enter after each." },
];

async function getItems() {
  try {
    const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return rows.map((s) => ({
      id: s.id,
      title: s.title,
      icon: s.icon,
      description: s.description,
      features: s.features,
    }));
  } catch {
    return [];
  }
}

export default async function ServicesAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="What you offer." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="title"
        subtitleKey="description"
        iconKey="icon"
        addLabel="Add service"
        create={createService}
        update={updateService}
        remove={deleteService}
      />
    </div>
  );
}

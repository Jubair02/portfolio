import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createService, updateService, deleteService, reorderServices } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "icon", label: "Icon", type: "icon", defaultValue: "Server" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "features", label: "Features", type: "tags", variant: "line", hint: "One feature per line — press Enter after each." },
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
        reorder={reorderServices}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createSocial, updateSocial, deleteSocial } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  {
    name: "platform",
    label: "Platform",
    type: "select",
    options: [
      "GitHub",
      "LinkedIn",
      "Facebook",
      "Instagram",
      "X",
      "YouTube",
      "Email",
      "Phone",
      "Website",
    ].map((p) => ({ label: p, value: p })),
  },
  { name: "url", label: "URL", type: "text", placeholder: "https://… or mailto: / tel:" },
  { name: "icon", label: "Icon", type: "text", hint: "Optional Lucide icon name" },
  { name: "visible", label: "Visible on site", type: "switch", defaultValue: true },
];

async function getItems() {
  try {
    const rows = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
    return rows.map((s) => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
      icon: s.icon ?? "",
      visible: s.visible,
    }));
  } catch {
    return [];
  }
}

export default async function SocialAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Social Links" description="Where people can find you." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="platform"
        subtitleKey="url"
        addLabel="Add link"
        create={createSocial}
        update={updateSocial}
        remove={deleteSocial}
      />
    </div>
  );
}

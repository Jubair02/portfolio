import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { EntityManager, type FieldConfig } from "@/components/admin/EntityManager";
import { createCertificate, updateCertificate, deleteCertificate } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "organization", label: "Organization", type: "text" },
  { name: "date", label: "Date", type: "text", placeholder: "2024" },
  { name: "icon", label: "Icon", type: "text", hint: "Lucide icon (e.g. BadgeCheck)" },
  { name: "credentialUrl", label: "Credential URL", type: "text", placeholder: "https://…" },
  { name: "image", label: "Certificate image", type: "image", folder: "portfolio/certificates" },
];

async function getItems() {
  try {
    const rows = await prisma.certificate.findMany({ orderBy: { order: "asc" } });
    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      organization: c.organization,
      date: c.date,
      credentialUrl: c.credentialUrl ?? "",
      image: c.image ?? "",
      icon: c.icon,
    }));
  } catch {
    return [];
  }
}

export default async function CertificatesAdminPage() {
  const items = await getItems();
  return (
    <div className="space-y-6">
      <PageHeader title="Certificates" description="Credentials and achievements." />
      <EntityManager
        items={items}
        fields={fields}
        labelKey="title"
        subtitleKey="organization"
        imageKey="image"
        iconKey="icon"
        addLabel="Add certificate"
        create={createCertificate}
        update={updateCertificate}
        remove={deleteCertificate}
      />
    </div>
  );
}

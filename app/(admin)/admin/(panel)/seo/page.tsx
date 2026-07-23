import { getSeo } from "@/lib/data";
import { PageHeader } from "@/components/admin/Field";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { FieldConfig } from "@/components/admin/EntityManager";
import { updateSeo } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "siteTitle", label: "Site title", type: "text" },
  { name: "metaDescription", label: "Meta description", type: "textarea" },
  { name: "keywords", label: "Keywords", type: "tags", hint: "Press Enter after each." },
  { name: "ogImage", label: "Open Graph image", type: "image", folder: "portfolio/seo" },
  { name: "favicon", label: "Favicon", type: "image", folder: "portfolio/seo" },
];

export default async function SeoAdminPage() {
  const s = await getSeo();
  return (
    <div className="space-y-6">
      <PageHeader title="SEO Settings" description="How your site appears in search and when shared." />
      <SettingsForm
        fields={fields}
        initial={{
          siteTitle: s.siteTitle,
          metaDescription: s.metaDescription,
          keywords: s.keywords,
          ogImage: s.ogImage ?? "",
          favicon: s.favicon ?? "",
        }}
        action={updateSeo}
      />
    </div>
  );
}

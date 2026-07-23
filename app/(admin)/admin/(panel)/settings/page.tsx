import { getSiteSettings } from "@/lib/data";
import { PageHeader } from "@/components/admin/Field";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { FieldConfig } from "@/components/admin/EntityManager";
import { updateSiteSettings } from "./actions";

export const dynamic = "force-dynamic";

const fields: FieldConfig[] = [
  { name: "siteUrl", label: "Site URL", type: "text", placeholder: "https://yourdomain.com", hint: "Used for canonical, OG and sitemap URLs." },
  { name: "footerText", label: "Footer text", type: "textarea" },
  { name: "copyright", label: "Copyright", type: "text" },
  { name: "resumeUrl", label: "Résumé file / URL", type: "text" },
  { name: "primaryColor", label: "Primary color", type: "text", placeholder: "#6d5efc" },
  { name: "accentColor", label: "Accent color", type: "text", placeholder: "#0891b2" },
  { name: "logo", label: "Logo", type: "image", folder: "portfolio/branding" },
];

export default async function SiteSettingsAdminPage() {
  const s = await getSiteSettings();
  return (
    <div className="space-y-6">
      <PageHeader title="Site Settings" description="Global branding and site-wide options." />
      <SettingsForm
        fields={fields}
        initial={{
          siteUrl: s.siteUrl,
          footerText: s.footerText ?? "",
          copyright: s.copyright ?? "",
          resumeUrl: s.resumeUrl ?? "",
          primaryColor: s.primaryColor ?? "",
          accentColor: s.accentColor ?? "",
          logo: s.logo ?? "",
        }}
        action={updateSiteSettings}
      />
    </div>
  );
}

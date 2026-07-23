import { getAbout } from "@/lib/data";
import { AboutForm } from "@/components/admin/about/AboutForm";
import { PageHeader } from "@/components/admin/Field";
import type { AboutFormValues } from "@/lib/schemas/about";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  const a = await getAbout();
  const initial: AboutFormValues = {
    eyebrow: a.eyebrow,
    title: a.title,
    paragraphs: a.paragraphs,
    values: a.values.map((v) => ({
      icon: v.icon,
      title: v.title,
      description: v.description,
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="About" description="Your story and what you value." />
      <AboutForm initial={initial} />
    </div>
  );
}

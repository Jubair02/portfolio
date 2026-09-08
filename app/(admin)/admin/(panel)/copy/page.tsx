import { getSiteCopy } from "@/lib/data";
import { PageHeader } from "@/components/admin/Field";
import { SiteCopyForm } from "@/components/admin/copy/SiteCopyForm";

export const dynamic = "force-dynamic";

export default async function SiteCopyAdminPage() {
  const copy = await getSiteCopy();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Copy"
        description="Headings, stats and short texts that appear across the public site."
      />
      <SiteCopyForm initial={copy} />
    </div>
  );
}

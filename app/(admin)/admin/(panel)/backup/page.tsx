import { PageHeader } from "@/components/admin/Field";
import { BackupPanel } from "@/components/admin/backup/BackupPanel";

export const dynamic = "force-dynamic";

export default function BackupAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore"
        description="Download all site content as a JSON file, or restore a previous download."
      />
      <BackupPanel />
    </div>
  );
}

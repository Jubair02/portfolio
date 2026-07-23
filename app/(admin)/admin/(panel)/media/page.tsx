import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/Field";
import { MediaLibrary, type Asset } from "@/components/admin/media/MediaLibrary";

export const dynamic = "force-dynamic";

async function getAssets(): Promise<Asset[]> {
  try {
    const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((a) => ({
      id: a.id,
      publicId: a.publicId,
      url: a.url,
      format: a.format,
      bytes: a.bytes,
      folder: a.folder,
    }));
  } catch {
    return [];
  }
}

export default async function MediaAdminPage() {
  const assets = await getAssets();
  return (
    <div className="space-y-6">
      <PageHeader title="Media Library" description="All images uploaded to Cloudinary." />
      <MediaLibrary assets={assets} />
    </div>
  );
}

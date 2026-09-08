import { prisma } from "@/lib/prisma";
import { collectImageUsages } from "@/lib/media-usage";
import { PageHeader } from "@/components/admin/Field";
import { MediaLibrary, type Asset } from "@/components/admin/media/MediaLibrary";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function MediaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const filter = sp.filter === "used" || sp.filter === "unused" ? sp.filter : "all";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  let all: Asset[] = [];
  try {
    const [rows, usage] = await Promise.all([
      prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
      collectImageUsages(),
    ]);
    all = rows.map((a) => ({
      id: a.id,
      publicId: a.publicId,
      url: a.url,
      format: a.format,
      bytes: a.bytes,
      folder: a.folder,
      resourceType: a.resourceType,
      usedIn: usage.get(a.url) ?? [],
    }));
  } catch {
    // DB unavailable → empty library
  }

  const unusedCount = all.filter((a) => a.usedIn.length === 0).length;
  const matching = all.filter(
    (a) =>
      (!q || a.url.toLowerCase().includes(q) || (a.folder ?? "").toLowerCase().includes(q)) &&
      (filter === "all" || (filter === "used" ? a.usedIn.length > 0 : a.usedIn.length === 0))
  );
  const total = matching.length;
  const assets = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`${all.length} file${all.length === 1 ? "" : "s"} on Cloudinary · ${all.length - unusedCount} in use · ${unusedCount} unused.`}
      />
      <MediaLibrary
        assets={assets}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={sp.q ?? ""}
        filter={filter}
        unusedCount={unusedCount}
      />
    </div>
  );
}

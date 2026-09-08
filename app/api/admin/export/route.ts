import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildContentBackup } from "@/lib/content-transfer";

export const dynamic = "force-dynamic";

/** Download every content table as one JSON file. Admin session required. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    const backup = await buildContentBackup();
    const stamp = backup.exportedAt?.slice(0, 19).replace(/[:T]/g, "-") ?? "export";
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="portfolio-content-${stamp}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export] failed:", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}

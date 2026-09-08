import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** RFC 4180: wrap in quotes, double any embedded quotes. */
function cell(value: string | boolean | Date | null): string {
  const s = value === null ? "" : value instanceof Date ? value.toISOString() : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Download every contact message as CSV. Admin session required. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    const header = ["received_at", "name", "email", "message", "read", "replied_at"];
    const lines = rows.map((m) =>
      [m.createdAt, m.name, m.email, m.message, m.read, m.repliedAt].map(cell).join(",")
    );
    // BOM so Excel opens UTF-8 names correctly.
    const csv = String.fromCharCode(0xfeff) + [header.join(","), ...lines].join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="contact-messages-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    console.error("[messages/export] failed:", err);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}

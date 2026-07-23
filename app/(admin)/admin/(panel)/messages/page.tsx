import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { PageHeader } from "@/components/admin/Field";
import { MessagesInbox, type Message } from "@/components/admin/messages/MessagesInbox";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function MessagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const filter = sp.filter ?? "all";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const where: Prisma.ContactMessageWhereInput = {
    ...(filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  let messages: Message[] = [];
  let total = 0;
  try {
    const [rows, count] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.contactMessage.count({ where }),
    ]);
    total = count;
    messages = rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }));
  } catch {
    // DB unavailable → empty inbox
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description={`${total} message${total === 1 ? "" : "s"} from your contact form.`}
      />
      <MessagesInbox
        messages={messages}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        filter={filter}
      />
    </div>
  );
}

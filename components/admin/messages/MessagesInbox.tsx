"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Mail,
  MailOpen,
  Reply,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { toggleRead, deleteMessage, markAllRead } from "@/app/(admin)/admin/(panel)/messages/actions";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent } from "@/components/admin/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export function MessagesInbox({
  messages,
  total,
  page,
  pageSize,
  q,
  filter,
}: {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filter: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(q);
  const [pending, start] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    start(async () => {
      const res = await fn();
      if (res.ok) router.refresh();
      else toast.error(res.error ?? "Failed.");
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam({ q: search || null, page: null });
          }}
          className="relative max-w-xs flex-1"
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, message…"
            className="pl-9"
          />
        </form>

        <div className="flex rounded-lg border border-border p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setParam({ filter: f.key === "all" ? null : f.key, page: null })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                (filter || "all") === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" disabled={pending} onClick={() => act(markAllRead)}>
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      </div>

      {/* List */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No messages found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <Card key={m.id} className={cn(!m.read && "border-primary/40 bg-primary/[0.03]")}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      <span className="truncate font-medium">{m.name}</span>
                      <span className="truncate text-sm text-muted-foreground">{m.email}</span>
                      {!m.read && <Badge className="ml-1">New</Badge>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label="Reply">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}>
                        <Reply className="size-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={m.read ? "Mark unread" : "Mark read"}
                      disabled={pending}
                      onClick={() => act(() => toggleRead(m.id, !m.read))}
                    >
                      {m.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                    </Button>
                    <ConfirmDialog
                      title="Delete this message?"
                      onConfirm={async () => {
                        const res = await deleteMessage(m.id);
                        if (res.ok) router.refresh();
                        return res;
                      }}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam({ page: String(page - 1) })}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setParam({ page: String(page + 1) })}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

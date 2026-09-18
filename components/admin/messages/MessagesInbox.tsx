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
  Download,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import {
  toggleRead,
  deleteMessage,
  markAllRead,
  replyToMessage,
} from "@/app/(admin)/admin/(panel)/messages/actions";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Field } from "@/components/admin/Field";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  name: string;
  email: string;
  /** Topic chosen on /contact ("New project", ...); null from the home form. */
  subject: string | null;
  message: string;
  read: boolean;
  repliedAt: string | null;
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
  emailConfigured,
}: {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filter: string;
  /** RESEND_API_KEY is set, so in-app replies can actually be delivered. */
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(q);
  const [pending, start] = useTransition();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, startSend] = useTransition();

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
      const res = await runAction(fn);
      if (res.ok) router.refresh();
      else toastActionError(res);
    });
  }

  function openReply(m: Message) {
    setReplyTo(m);
    // Echo the topic they picked so the thread reads naturally in their inbox.
    setSubject(m.subject ? `Re: ${m.subject}` : "Re: your message from my portfolio");
    setBody(`Hi ${m.name.trim().split(/\s+/)[0] || m.name},\n\n`);
  }

  function sendReply() {
    if (!replyTo) return;
    startSend(async () => {
      const res = await runAction(() => replyToMessage(replyTo.id, { subject, body }));
      if (res.ok) {
        toast.success(`Reply sent to ${replyTo.email}.`);
        setReplyTo(null);
        router.refresh();
      } else {
        toastActionError(res);
      }
    });
  }

  const mailto = (m: Message) =>
    `mailto:${m.email}?subject=${encodeURIComponent(subject || "Re: your message")}&body=${encodeURIComponent(body)}`;

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
        <Button variant="outline" size="sm" asChild>
          <a href="/api/admin/messages/export" download>
            <Download className="size-4" /> Export CSV
          </a>
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
                    <div className="flex flex-wrap items-center gap-2">
                      {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                      <span className="truncate font-medium">{m.name}</span>
                      <a href={`mailto:${m.email}`} className="truncate text-sm text-muted-foreground hover:text-foreground">
                        {m.email}
                      </a>
                      {!m.read && <Badge className="ml-1">New</Badge>}
                      {m.repliedAt && (
                        <Badge variant="success" className="ml-1 gap-1">
                          <Reply className="size-3" /> Replied
                        </Badge>
                      )}
                      {m.subject && (
                        <Badge variant="outline" className="ml-1">
                          {m.subject}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      {/* Rendered in the viewer's locale/timezone; the server value may differ. */}
                      <time dateTime={m.createdAt} suppressHydrationWarning>
                        {new Date(m.createdAt).toLocaleString()}
                      </time>
                      {m.repliedAt && (
                        <>
                          {" · replied "}
                          <time dateTime={m.repliedAt} suppressHydrationWarning>
                            {new Date(m.repliedAt).toLocaleString()}
                          </time>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Reply" onClick={() => openReply(m)}>
                      <Reply className="size-4" />
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
                        const res = await runAction(() => deleteMessage(m.id));
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
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })}>
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setParam({ page: String(page + 1) })}>
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Reply dialog */}
      <Dialog open={!!replyTo} onOpenChange={(o) => !o && !sending && setReplyTo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {replyTo?.name}</DialogTitle>
            <DialogDescription>
              Sent to <span className="font-medium text-foreground">{replyTo?.email}</span> from your
              contact address. Replies they send come back to your inbox.
            </DialogDescription>
          </DialogHeader>
          {replyTo && (
            <blockquote className="max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
              {replyTo.message}
            </blockquote>
          )}
          <div className="space-y-3">
            <Field label="Subject" htmlFor="reply-subject">
              <Input id="reply-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Message" htmlFor="reply-body">
              <Textarea id="reply-body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
            {!emailConfigured && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Email sending isn&apos;t configured (RESEND_API_KEY). Use “Open in mail app” instead.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {replyTo && (
              <Button variant="ghost" size="sm" asChild>
                <a href={mailto(replyTo)}>
                  <ExternalLink className="size-4" /> Open in mail app
                </a>
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReplyTo(null)} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={sendReply} disabled={sending || !emailConfigured || !subject.trim() || !body.trim()}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

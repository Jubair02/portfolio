"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  UploadCloud,
  Copy,
  Trash2,
  Search,
  Loader2,
  Check,
  FileText,
  ChevronLeft,
  ChevronRight,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadImageAction,
  deleteImageAction,
  deleteUnusedAssetsAction,
} from "@/lib/actions/upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent } from "@/components/admin/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export type Asset = {
  id: string;
  publicId: string;
  url: string;
  format: string | null;
  bytes: number | null;
  folder: string | null;
  /** "image" or "raw" (PDF). */
  resourceType: string;
  /** Human-readable places that reference this file. Empty = unused. */
  usedIn: string[];
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "used", label: "In use" },
  { key: "unused", label: "Unused" },
];

export function MediaLibrary({
  assets,
  total,
  page,
  pageSize,
  q,
  filter,
  unusedCount,
}: {
  assets: Asset[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filter: string;
  unusedCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState(q);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function setParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function upload(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`Image is larger than ${MAX_UPLOAD_LABEL}. Please choose a smaller file.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "portfolio/library");
    start(async () => {
      try {
        const res = await uploadImageAction(fd);
        if (res.error) toast.error(res.error);
        else {
          toast.success("Uploaded.");
          router.refresh();
        }
      } catch (err) {
        console.error("[upload] client error:", err);
        toast.error("Upload failed. The image may be too large or the connection dropped.");
      }
    });
  }

  function copy(url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
    toast.success("URL copied.");
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
            placeholder="Search by URL or folder…"
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
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {unusedCount > 0 && (
            <ConfirmDialog
              title={`Delete ${unusedCount} unused file${unusedCount === 1 ? "" : "s"}?`}
              description="Only files that no page, project, post or setting references are removed — from Cloudinary and from this library."
              confirmLabel="Delete unused"
              onConfirm={async () => {
                const res = await deleteUnusedAssetsAction();
                if (res.ok) router.refresh();
                return res;
              }}
              trigger={
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="size-4" /> Delete unused ({unusedCount})
                </Button>
              }
            />
          )}
          <Button disabled={pending} onClick={() => inputRef.current?.click()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            Upload
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {q || filter !== "all" ? "No files match." : "No media yet. Upload your first image."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <Card key={a.id} className="group overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {a.resourceType === "raw" ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                    aria-label="Open file"
                  >
                    <FileText className="size-8" />
                    <span className="text-xs font-medium uppercase">{a.format ?? "file"}</span>
                  </a>
                ) : (
                  <Image src={a.url} alt="" fill className="object-cover" unoptimized />
                )}
                {/* Usage badge — the tooltip lists every place. */}
                <span className="absolute left-2 top-2" title={a.usedIn.join("\n") || "Not referenced by any content"}>
                  {a.usedIn.length > 0 ? (
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <Link2 className="size-3" /> Used ×{a.usedIn.length}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Unused
                    </Badge>
                  )}
                </span>
              </div>
              <CardContent className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-muted-foreground" title={a.folder ?? ""}>
                  {a.format?.toUpperCase()} · {a.bytes ? `${Math.round(a.bytes / 1024)}KB` : ""}
                </span>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Copy URL" onClick={() => copy(a.url)}>
                    {copied === a.url ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                  <ConfirmDialog
                    title="Delete this file?"
                    description={
                      a.usedIn.length > 0
                        ? `This file is still used by ${a.usedIn.slice(0, 2).join(" and ")}${a.usedIn.length > 2 ? " and more" : ""}. Replace it there first.`
                        : "It will be removed from Cloudinary and the library."
                    }
                    onConfirm={async () => {
                      const res = await deleteImageAction(a.publicId);
                      if (res.error) return { ok: false, error: res.error };
                      router.refresh();
                      return { ok: true };
                    }}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label="Delete">
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
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
    </div>
  );
}

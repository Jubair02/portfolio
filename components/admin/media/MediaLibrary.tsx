"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { UploadCloud, Copy, Trash2, Search, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadImageAction, deleteImageAction } from "@/lib/actions/upload";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export type Asset = {
  id: string;
  publicId: string;
  url: string;
  format: string | null;
  bytes: number | null;
  folder: string | null;
};

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = assets.filter(
    (a) =>
      !query ||
      a.url.toLowerCase().includes(query.toLowerCase()) ||
      (a.folder ?? "").toLowerCase().includes(query.toLowerCase())
  );

  function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "portfolio/library");
    start(async () => {
      const res = await uploadImageAction(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Uploaded.");
        router.refresh();
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media…" className="pl-9" />
        </div>
        <Button disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          Upload
        </Button>
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

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {query ? "No media matches your search." : "No media yet. Upload your first image."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <Card key={a.id} className="group overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <Image src={a.url} alt="" fill className="object-cover" unoptimized />
              </div>
              <CardContent className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-muted-foreground">
                  {a.format?.toUpperCase()} · {a.bytes ? `${Math.round(a.bytes / 1024)}KB` : ""}
                </span>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Copy URL" onClick={() => copy(a.url)}>
                    {copied === a.url ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                  <ConfirmDialog
                    title="Delete this image?"
                    description="It will be removed from Cloudinary and the library."
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
    </div>
  );
}

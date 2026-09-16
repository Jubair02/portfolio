"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, Trash2, Presentation, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadDeckAction } from "@/lib/actions/upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { pdfThumbUrl } from "@/lib/pdf-slides";
import type { ProjectDeck } from "@/content/site";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

/**
 * Slide-deck field. The file must be a PDF: PowerPoint can't be rendered in a
 * browser, but Cloudinary turns each page of a PDF into an image, which is
 * what the public viewer shows.
 */
export function DeckUpload({
  value,
  onChange,
}: {
  value: ProjectDeck | null;
  onChange: (deck: ProjectDeck | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`That deck is larger than ${MAX_UPLOAD_LABEL}. Try exporting at a lower quality.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      try {
        const res = await uploadDeckAction(fd);
        if (res.error || !res.url || !res.pages) {
          toast.error(res.error ?? "Upload failed.");
          return;
        }
        onChange({
          url: res.url,
          publicId: res.publicId,
          pages: res.pages,
          label: value?.label,
        });
        toast.success(`Deck uploaded — ${res.pages} slides. Save the form to publish it.`);
      } catch (err) {
        console.error("[deck] client error:", err);
        toast.error("Upload failed. The file may be too large or the connection dropped.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex flex-wrap items-start gap-4 rounded-xl border border-border p-3">
          <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={pdfThumbUrl(value.url, 1)}
              alt="First slide"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Presentation className="size-4 text-primary" />
              {value.pages} slide{value.pages === 1 ? "" : "s"}
            </p>
            <Input
              value={value.label ?? ""}
              placeholder="Heading shown above the deck (optional)"
              onChange={(e) => onChange({ ...value, label: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                Replace
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={value.url} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="size-4" /> Open PDF
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
          <span>{pending ? "Uploading…" : "Upload a PDF deck"}</span>
          <span className="text-xs">Export your slides to PDF first</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

"use client";

import { useRef, useTransition } from "react";
import { FileText, UploadCloud, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadResumeAction } from "@/lib/actions/upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

/**
 * Résumé field: a URL/path input plus a PDF upload that fills it in. The
 * public "Download résumé" button links to whatever ends up in the input, so
 * a manually typed path such as /Resume.pdf keeps working.
 */
export function ResumeUpload({
  value,
  onChange,
  id,
  invalid,
}: {
  value: string;
  onChange: (url: string) => void;
  id?: string;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  function handleFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`The PDF is larger than ${MAX_UPLOAD_LABEL}. Please choose a smaller file.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      try {
        const res = await uploadResumeAction(fd);
        if (res.error || !res.url) {
          toast.error(res.error ?? "Upload failed.");
          return;
        }
        onChange(res.url);
        toast.success("Résumé uploaded. Save the form to publish it.");
      } catch (err) {
        console.error("[resume] upload error:", err);
        toast.error("Upload failed. The file may be too large or the connection dropped.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          aria-invalid={invalid}
          placeholder="/Resume.pdf or https://…"
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="shrink-0"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          Upload PDF
        </Button>
      </div>
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
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <FileText className="size-3.5" />
          Open current résumé
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}

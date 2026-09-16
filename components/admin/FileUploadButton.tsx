"use client";

import { useRef, useTransition } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAttachmentAction } from "@/lib/actions/upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { Button } from "@/components/admin/ui/button";

/** Uploads one document and hands back its URL. Used by the attachment rows. */
export function FileUploadButton({
  onUploaded,
  label = "Upload",
}: {
  onUploaded: (file: { url: string; publicId?: string; name: string }) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="shrink-0"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx,.csv,.txt,.zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > MAX_UPLOAD_BYTES) {
            toast.error(`That file is larger than ${MAX_UPLOAD_LABEL}.`);
            return;
          }
          const fd = new FormData();
          fd.append("file", file);
          start(async () => {
            try {
              const res = await uploadAttachmentAction(fd);
              if (res.error || !res.url) {
                toast.error(res.error ?? "Upload failed.");
                return;
              }
              onUploaded({ url: res.url, publicId: res.publicId, name: file.name });
              toast.success("File uploaded.");
            } catch (err) {
              console.error("[attachment] client error:", err);
              toast.error("Upload failed. The file may be too large or the connection dropped.");
            }
          });
        }}
      />
    </>
  );
}

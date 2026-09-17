"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/cloudinary-upload";
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
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);

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
        {pending ? `${progress}%` : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx,.csv,.txt,.zip"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > MAX_UPLOAD_BYTES) {
            toast.error(`That file is larger than ${MAX_UPLOAD_LABEL}.`);
            return;
          }
          setPending(true);
          setProgress(0);
          try {
            const res = await uploadFile(file, "attachment", { onProgress: setProgress });
            if (res.error || !res.url) {
              toast.error(res.error ?? "Upload failed.");
              return;
            }
            onUploaded({ url: res.url, publicId: res.publicId, name: file.name });
            toast.success("File uploaded.");
          } catch (err) {
            console.error("[attachment] client error:", err);
            toast.error("Upload failed. The connection may have dropped.");
          } finally {
            setPending(false);
          }
        }}
      />
    </>
  );
}

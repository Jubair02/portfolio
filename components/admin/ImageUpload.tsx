"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/cloudinary-upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  folder = "portfolio",
  className,
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`Image is larger than ${MAX_UPLOAD_LABEL}. Please choose a smaller file.`);
      return;
    }
    setPending(true);
    setProgress(0);
    try {
      const res = await uploadFile(file, "image", { folder, onProgress: setProgress });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.url) {
        onChange(res.url);
        toast.success("Image uploaded.");
      }
    } catch (err) {
      console.error("[upload] client error:", err);
      toast.error("Upload failed. The connection may have dropped.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-border">
          <Image
            src={value}
            alt="Uploaded preview"
            width={640}
            height={360}
            className="h-40 w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={cn(
            "flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
            dragging && "border-primary bg-primary/5"
          )}
        >
          {pending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <UploadCloud className="size-6" />
          )}
          <span>{pending ? `Uploading… ${progress}%` : "Click or drag an image to upload"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {pending ? `${progress}%` : "Replace"}
        </Button>
      )}
    </div>
  );
}

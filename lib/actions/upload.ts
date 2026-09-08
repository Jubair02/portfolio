"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, uploadRawBuffer, deleteAsset } from "@/lib/cloudinary";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { collectImageUsages, findImageUsages } from "@/lib/media-usage";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

export type UploadState = { url?: string; publicId?: string; error?: string };

/** Auth-guarded image upload used by every admin image field. */
export async function uploadImageAction(formData: FormData): Promise<UploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (!ALLOWED.includes(file.type)) return { error: "Unsupported file type." };
  if (file.size > MAX_UPLOAD_BYTES)
    return { error: `File is larger than ${MAX_UPLOAD_LABEL}.` };

  try {
    const folder = (formData.get("folder") as string) || "portfolio";
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, folder);

    await prisma.mediaAsset.create({
      data: {
        publicId: result.publicId,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        folder,
        resourceType: "image",
      },
    });

    return { url: result.url, publicId: result.publicId };
  } catch (err) {
    console.error("[upload] failed:", err);
    return { error: "Upload failed. Check your Cloudinary credentials." };
  }
}

/**
 * Résumé (PDF) upload. Stored as a Cloudinary raw asset under a stable name so
 * re-uploading replaces the file; the versioned URL still changes, which is
 * what busts the CDN cache.
 *
 * Cloudinary accounts created recently block PDF delivery until "Allow
 * delivery of PDF and ZIP files" is switched on under Settings → Security. If
 * the uploaded link returns 401, that is the switch to flip.
 */
export async function uploadResumeAction(formData: FormData): Promise<UploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return { error: "Please upload a PDF file." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: `File is larger than ${MAX_UPLOAD_LABEL}.` };

  // PDFs start with "%PDF-"; reject anything merely renamed to .pdf.
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { error: "That file does not look like a PDF." };
  }

  try {
    const folder = "portfolio/resume";
    const result = await uploadRawBuffer(buffer, folder, "resume.pdf");
    await prisma.mediaAsset.upsert({
      where: { publicId: result.publicId },
      update: { url: result.url, bytes: result.bytes, format: "pdf", folder, resourceType: "raw" },
      create: {
        publicId: result.publicId,
        url: result.url,
        format: "pdf",
        bytes: result.bytes,
        folder,
        resourceType: "raw",
      },
    });
    return { url: result.url, publicId: result.publicId };
  } catch (err) {
    console.error("[resume] upload failed:", err);
    return { error: "Upload failed. Check your Cloudinary credentials." };
  }
}


/**
 * Delete an uploaded asset (from Cloudinary + media library) — unless some
 * content still references it, in which case the caller is told where.
 */
export async function deleteImageAction(publicId: string): Promise<UploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });
    if (asset) {
      const usages = await findImageUsages(asset.url);
      if (usages.length > 0) {
        const list = usages.slice(0, 3).join(", ");
        const more = usages.length > 3 ? ` and ${usages.length - 3} more` : "";
        return {
          error: `Still in use by ${list}${more}. Replace or remove it there first.`,
        };
      }
    }
    await deleteAsset(publicId, asset?.resourceType === "raw" ? "raw" : "image");
    await prisma.mediaAsset.deleteMany({ where: { publicId } });
    return { publicId };
  } catch (err) {
    console.error("[upload] delete failed:", err);
    return { error: "Delete failed." };
  }
}

/** Remove every asset that no content references (Cloudinary + library). */
export async function deleteUnusedAssetsAction(): Promise<{ ok: boolean; error?: string; deleted?: number }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authorized." };
  try {
    const [assets, usage] = await Promise.all([prisma.mediaAsset.findMany(), collectImageUsages()]);
    const unused = assets.filter((a) => !usage.has(a.url));
    let deleted = 0;
    for (const a of unused) {
      try {
        await deleteAsset(a.publicId, a.resourceType === "raw" ? "raw" : "image");
        await prisma.mediaAsset.delete({ where: { id: a.id } });
        deleted += 1;
      } catch (err) {
        console.warn(`[media] could not delete ${a.publicId}:`, err);
      }
    }
    return { ok: true, deleted };
  } catch (err) {
    console.error("[media] delete unused failed:", err);
    return { ok: false, error: "Could not clean up unused files." };
  }
}

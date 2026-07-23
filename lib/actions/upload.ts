"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

export type UploadState = { url?: string; publicId?: string; error?: string };

/** Auth-guarded image upload used by every admin image field. */
export async function uploadImageAction(formData: FormData): Promise<UploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (!ALLOWED.includes(file.type)) return { error: "Unsupported file type." };
  if (file.size > MAX_BYTES) return { error: "File is larger than 8 MB." };

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
      },
    });

    return { url: result.url, publicId: result.publicId };
  } catch (err) {
    console.error("[upload] failed:", err);
    return { error: "Upload failed. Check your Cloudinary credentials." };
  }
}

/** Delete an uploaded asset (from Cloudinary + media library). */
export async function deleteImageAction(publicId: string): Promise<UploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };
  try {
    await deleteAsset(publicId);
    await prisma.mediaAsset.deleteMany({ where: { publicId } });
    return { publicId };
  } catch (err) {
    console.error("[upload] delete failed:", err);
    return { error: "Delete failed." };
  }
}

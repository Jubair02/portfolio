"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signUpload, getResource, deleteAsset, type SignedUpload } from "@/lib/cloudinary";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { collectImageUsages, findImageUsages } from "@/lib/media-usage";

export type UploadState = { url?: string; publicId?: string; error?: string };

/** A deck upload also reports how many slides it has. */
export type DeckUploadState = UploadState & { pages?: number };

/** The kinds of upload the admin panel can start, each with its own rules. */
export type UploadKind = "image" | "deck" | "resume" | "attachment";

export type SignUploadState = { upload?: SignedUpload; error?: string };

/** Formats an image field accepts, signed so the browser cannot widen it. */
const IMAGE_FORMATS = "jpg,jpeg,png,webp,avif,gif,svg";

/** Documents an attachment may be, beyond a PDF. */
const ATTACHMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  zip: "application/zip",
};

/** Résumés and attachments are stored as Cloudinary "raw" assets. */
const RAW_KINDS: ReadonlySet<UploadKind> = new Set<UploadKind>(["resume", "attachment"]);

/** "My Deck (final).pdf" → "my-deck-final-1737040000.pdf", unique per upload. */
function safeFileName(original: string): string {
  const dot = original.lastIndexOf(".");
  const ext = (dot > -1 ? original.slice(dot + 1) : "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = (dot > -1 ? original.slice(0, dot) : original)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";
  return `${base}-${Date.now().toString(36)}${ext ? "." + ext : ""}`;
}

/**
 * Confine a caller-supplied folder to the portfolio tree.
 *
 * Image fields pick their own folder ("portfolio/projects", "portfolio/og" and
 * so on) and that choice now arrives from the browser, so it is scrubbed and
 * forced under `portfolio/` before it goes anywhere near a signature.
 */
function safeFolder(input: string | undefined): string {
  const cleaned = (input ?? "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned === "portfolio") return "portfolio";
  return cleaned.startsWith("portfolio/") ? cleaned : `portfolio/${cleaned}`;
}

/** "portfolio/decks/abc123" → "portfolio/decks". */
function folderOf(publicId: string): string {
  const slash = publicId.lastIndexOf("/");
  return slash > -1 ? publicId.slice(0, slash) : "";
}

/**
 * First half of an upload: hand the browser a signature for one specific file.
 *
 * The file itself is deliberately not routed through this Server Action.
 * Vercel caps a function's request body at 4.5 MB and no Next config can lift
 * that, so a file posted here fails in production at sizes that work locally —
 * which is exactly how the old 8 MB limit misled editors. The browser uploads
 * straight to Cloudinary instead, and only the resulting public id comes back.
 */
export async function signUploadAction(
  kind: UploadKind,
  options: { folder?: string; fileName?: string } = {}
): Promise<SignUploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  try {
    switch (kind) {
      case "image":
        return {
          upload: signUpload("image", {
            folder: safeFolder(options.folder),
            allowed_formats: IMAGE_FORMATS,
          }),
        };

      case "deck":
        // Uploaded as an *image* resource so Cloudinary reports the page count
        // and can rasterise each page — see lib/pdf-slides.ts.
        return {
          upload: signUpload("image", { folder: "portfolio/decks", allowed_formats: "pdf" }),
        };

      case "resume":
        // Stable public id, so re-uploading replaces the file. The versioned
        // URL still changes, which is what busts the CDN cache.
        return {
          upload: signUpload("raw", {
            folder: "portfolio/resume",
            public_id: "resume.pdf",
            overwrite: true,
            invalidate: true,
          }),
        };

      case "attachment": {
        const ext = (options.fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
        if (!(ext in ATTACHMENT_TYPES)) {
          return {
            error: `Unsupported file type. Allowed: ${Object.keys(ATTACHMENT_TYPES).join(", ")}.`,
          };
        }
        return {
          upload: signUpload("raw", {
            folder: "portfolio/attachments",
            public_id: safeFileName(options.fileName ?? ""),
          }),
        };
      }

      default:
        return { error: "Unknown upload type." };
    }
  } catch (err) {
    console.error("[upload] could not sign:", err);
    return { error: "Uploads are not configured. Check your Cloudinary credentials." };
  }
}

/**
 * Second half of an upload: verify what actually landed, then record it.
 *
 * Nothing the browser says about the file is trusted — size, format and page
 * count are read back from Cloudinary. An asset that fails a check is deleted
 * again rather than left orphaned, since a signature is enough to store a file
 * and the browser can simply walk away afterwards.
 *
 * Cloudinary accounts created recently block PDF delivery until "Allow
 * delivery of PDF and ZIP files" is switched on under Settings → Security. If
 * an uploaded link returns 401, that is the switch to flip.
 */
export async function registerUploadAction(
  kind: UploadKind,
  publicId: string
): Promise<DeckUploadState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };
  if (typeof publicId !== "string" || !publicId) return { error: "No file provided." };
  // The signature already confines uploads to the portfolio tree; refusing ids
  // from outside it keeps this from becoming a way to file arbitrary assets.
  if (!publicId.startsWith("portfolio/")) return { error: "Unexpected upload location." };

  const resourceType = RAW_KINDS.has(kind) ? "raw" : "image";

  let asset;
  try {
    asset = await getResource(publicId, resourceType);
  } catch (err) {
    console.error(`[${kind}] could not verify upload:`, err);
    return { error: "The upload finished but could not be verified. Please try again." };
  }

  /** Reject an upload and take the stored file back down with it. */
  const discard = async (error: string): Promise<DeckUploadState> => {
    try {
      await deleteAsset(publicId, resourceType);
    } catch (err) {
      console.warn(`[${kind}] could not remove rejected upload ${publicId}:`, err);
    }
    return { error };
  };

  if ((asset.bytes ?? 0) > MAX_UPLOAD_BYTES) {
    return discard(`File is larger than ${MAX_UPLOAD_LABEL}.`);
  }

  try {
    if (kind === "deck") {
      if (asset.format !== "pdf") return discard("That file is not a PDF.");
      if (!asset.pages || asset.pages < 1) {
        return discard(
          "Cloudinary could not read the pages of that PDF. It may be encrypted or damaged — try re-exporting it."
        );
      }
      await prisma.mediaAsset.create({
        data: {
          publicId,
          url: asset.url,
          format: "pdf",
          bytes: asset.bytes,
          folder: "portfolio/decks",
          resourceType: "image",
        },
      });
      return { url: asset.url, publicId, pages: asset.pages };
    }

    if (kind === "resume") {
      // Upserted: the fixed public id means a re-upload overwrites the same
      // Cloudinary asset, so a row for it already exists.
      const record = {
        url: asset.url,
        bytes: asset.bytes,
        format: "pdf",
        folder: "portfolio/resume",
        resourceType: "raw",
      };
      await prisma.mediaAsset.upsert({
        where: { publicId },
        update: record,
        create: { publicId, ...record },
      });
      return { url: asset.url, publicId };
    }

    await prisma.mediaAsset.create({
      data: {
        publicId,
        url: asset.url,
        width: asset.width,
        height: asset.height,
        // Raw assets have no Cloudinary-parsed format; fall back to the
        // extension the server itself put on the public id.
        format: asset.format ?? publicId.split(".").pop() ?? null,
        bytes: asset.bytes,
        folder: folderOf(publicId),
        resourceType,
      },
    });
    return { url: asset.url, publicId };
  } catch (err) {
    console.error(`[${kind}] could not record upload:`, err);
    return { error: "Upload finished but could not be saved to the media library." };
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

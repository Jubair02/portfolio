"use client";

import {
  signUploadAction,
  registerUploadAction,
  type UploadKind,
  type DeckUploadState,
} from "@/lib/actions/upload";
import type { SignedUpload } from "@/lib/cloudinary";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";

export type UploadOptions = {
  /** Cloudinary folder for image uploads; ignored by the other kinds. */
  folder?: string;
  /** 0-100, fired as the bytes go up. Worth showing: files can be ~10 MB. */
  onProgress?: (percent: number) => void;
};

/**
 * Upload one file straight to Cloudinary from the browser.
 *
 * Three steps: ask the server to sign this specific upload, POST the bytes to
 * Cloudinary, then hand the resulting public id back so the server can verify
 * and record it. The file never passes through a Server Action, which is what
 * keeps Vercel's 4.5 MB request-body cap out of the picture — see
 * lib/upload-limits.ts.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  options: UploadOptions = {}
): Promise<DeckUploadState> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `That file is larger than ${MAX_UPLOAD_LABEL}.` };
  }
  if ((kind === "resume" || kind === "deck") && !(await looksLikePdf(file))) {
    return { error: "That file does not look like a PDF." };
  }

  const signed = await signUploadAction(kind, { folder: options.folder, fileName: file.name });
  if (signed.error || !signed.upload) {
    return { error: signed.error ?? "Could not start the upload." };
  }

  let publicId: string;
  try {
    publicId = await postToCloudinary(file, signed.upload, options.onProgress);
  } catch (err) {
    console.error(`[${kind}] direct upload failed:`, err);
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  return registerUploadAction(kind, publicId);
}

/**
 * POST the file to Cloudinary and return the public id it assigned.
 *
 * XMLHttpRequest rather than fetch: it is the only way to get upload progress,
 * and a 10 MB file on a slow connection is a long time to show nothing.
 */
function postToCloudinary(
  file: File,
  upload: SignedUpload,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    // Every signed param must go back exactly as issued or Cloudinary rejects
    // the signature, so send the server's map verbatim rather than rebuilding it.
    for (const [key, value] of Object.entries(upload.params)) form.append(key, value);
    form.append("api_key", upload.apiKey);
    form.append("signature", upload.signature);
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", upload.endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let body: { public_id?: string; error?: { message?: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Cloudinary answers with JSON even on failure; a parse error means
        // something else replied, so fall through to the status-code message.
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.public_id) {
        resolve(body.public_id);
        return;
      }
      reject(new Error(body.error?.message ?? `Cloudinary rejected the upload (${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.ontimeout = () => reject(new Error("The upload timed out."));

    xhr.send(form);
  });
}

/**
 * Keep the "%PDF-" sniff the Server Action used to do on the received buffer.
 * Now that the bytes go straight to Cloudinary the browser is the only place
 * that sees them first. This is a footgun guard against a file merely renamed
 * to .pdf, not a security boundary — the real check is the format Cloudinary
 * reports back to registerUploadAction.
 */
async function looksLikePdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  /** Page count, present when a PDF is uploaded as an image resource. */
  pages?: number;
};

/** Everything the browser needs to POST one file straight to Cloudinary. */
export type SignedUpload = {
  endpoint: string;
  apiKey: string;
  signature: string;
  /** Signed params. Every one must be sent back verbatim or the signature breaks. */
  params: Record<string, string>;
};

/**
 * Sign one direct-to-Cloudinary upload.
 *
 * The browser must never see the API secret, so the server signs a fixed set
 * of params — folder, public id, allowed formats — and the browser can only
 * send exactly those back. Altering any of them invalidates the signature, so
 * an editor cannot redirect an upload into another folder or smuggle in a
 * format the field does not accept.
 *
 * Signatures are timestamped and Cloudinary rejects stale ones (one hour), so
 * a leaked signature is not a standing upload grant.
 */
export function signUpload(
  resourceType: "image" | "raw",
  params: Record<string, string | number | boolean>
): SignedUpload {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  // Cloudinary signs the string form of every value, so build the exact map
  // the browser will send rather than signing one shape and posting another.
  const signed: Record<string, string> = { timestamp: String(Math.round(Date.now() / 1000)) };
  for (const [key, value] of Object.entries(params)) signed[key] = String(value);

  return {
    endpoint: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    apiKey,
    signature: cloudinary.utils.api_sign_request(signed, apiSecret),
    params: signed,
  };
}

/**
 * Read an uploaded asset's real metadata back from Cloudinary.
 *
 * After a direct upload this is the server's only trustworthy account of what
 * was actually stored — size, format and page count all come from here rather
 * than from whatever the browser claims.
 */
export async function getResource(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<UploadResult> {
  const resource = await cloudinary.api.resource(publicId, { resource_type: resourceType });
  return {
    url: resource.secure_url,
    publicId: resource.public_id,
    width: resource.width,
    height: resource.height,
    format: resource.format,
    bytes: resource.bytes,
    pages: (resource as { pages?: number }).pages,
  };
}

/** Delete an asset from Cloudinary by public id. */
export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };

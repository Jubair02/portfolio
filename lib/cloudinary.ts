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

/** Upload an image buffer to Cloudinary under the given folder. */
export function uploadBuffer(
  buffer: Buffer,
  folder = "portfolio"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload a non-image file (PDF résumé) as a Cloudinary "raw" asset. Raw public
 * ids carry their extension, so the delivered URL ends in .pdf and browsers
 * open it as a document.
 */
export function uploadRawBuffer(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw", public_id: filename, overwrite: true, invalidate: true },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: filename.split(".").pop(),
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload a PDF as an *image* resource. Cloudinary then reports the page count
 * and can rasterise any single page, which is what the slide viewer renders.
 * (Raw uploads, used for the résumé, support neither.)
 */
export function uploadPdfAsImage(buffer: Buffer, folder: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          pages: (result as { pages?: number }).pages,
        });
      }
    );
    stream.end(buffer);
  });
}

/** Delete an asset from Cloudinary by public id. */
export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };

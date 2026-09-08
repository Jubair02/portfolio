"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";

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
      },
    });

    return { url: result.url, publicId: result.publicId };
  } catch (err) {
    console.error("[upload] failed:", err);
    return { error: "Upload failed. Check your Cloudinary credentials." };
  }
}

/**
 * Every place an uploaded image URL can be stored. Deleting an asset that one
 * of these still points at would leave a broken image on the live site.
 */
async function findImageUsages(url: string): Promise<string[]> {
  const [hero, projects, testimonials, certificates, experiences, educations, settings, seo, users] =
    await Promise.all([
      prisma.hero.findUnique({
        where: { id: "singleton" },
        select: { heroImage: true, backgroundImage: true },
      }),
      prisma.project.findMany({
        where: { OR: [{ image: url }, { screenshots: { has: url } }] },
        select: { title: true },
      }),
      prisma.testimonial.findMany({ where: { image: url }, select: { name: true } }),
      prisma.certificate.findMany({ where: { image: url }, select: { title: true } }),
      prisma.experience.findMany({ where: { logo: url }, select: { company: true } }),
      prisma.education.findMany({ where: { logo: url }, select: { institute: true } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { logo: true } }),
      prisma.seoSettings.findUnique({
        where: { id: "singleton" },
        select: { ogImage: true, favicon: true },
      }),
      prisma.user.findMany({ where: { image: url }, select: { name: true } }),
    ]);

  const used: string[] = [];
  if (hero?.heroImage === url) used.push("Hero image");
  if (hero?.backgroundImage === url) used.push("Hero background");
  for (const p of projects) used.push(`project “${p.title}”`);
  for (const t of testimonials) used.push(`testimonial from ${t.name}`);
  for (const c of certificates) used.push(`certificate “${c.title}”`);
  for (const e of experiences) used.push(`experience at ${e.company}`);
  for (const e of educations) used.push(`education at ${e.institute}`);
  if (settings?.logo === url) used.push("Site Settings logo");
  if (seo?.ogImage === url) used.push("SEO Open Graph image");
  if (seo?.favicon === url) used.push("SEO favicon");
  for (const u of users) used.push(`profile picture of ${u.name}`);
  return used;
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
    await deleteAsset(publicId);
    await prisma.mediaAsset.deleteMany({ where: { publicId } });
    return { publicId };
  } catch (err) {
    console.error("[upload] delete failed:", err);
    return { error: "Delete failed." };
  }
}

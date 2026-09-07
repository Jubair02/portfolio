import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { getSeo } from "@/lib/data";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const revalidate = 3600;

/**
 * Next's `app/icon` file convention always beats `metadata.icons`, so the
 * "Favicon" field in Admin → SEO can only take effect if this route honours it.
 * With no upload configured it falls back to the generated monogram.
 */
export default async function Icon() {
  const { favicon } = await getSeo();

  if (favicon) {
    // Same-origin path (e.g. "/favicon.ico"): hand the browser straight to it.
    if (favicon.startsWith("/")) {
      return new Response(null, { status: 307, headers: { location: favicon } });
    }
    // Remote upload (Cloudinary): proxy the bytes so /icon stays a real image.
    try {
      const upstream = await fetch(favicon, { next: { revalidate } });
      const type = upstream.headers.get("content-type") ?? "";
      if (upstream.ok && type.startsWith("image/")) {
        return new Response(await upstream.arrayBuffer(), {
          headers: {
            "content-type": type,
            "cache-control": "public, max-age=0, must-revalidate",
          },
        });
      }
      console.warn(`[icon] Favicon unusable (${upstream.status} ${type}): ${favicon}`);
    } catch (err) {
      console.warn("[icon] Could not fetch favicon:", err);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d5efc 0%, #c026d3 100%)",
          color: "white",
          fontSize: 34,
          fontWeight: 700,
          borderRadius: 14,
        }}
      >
        {site.initials}
      </div>
    ),
    { ...size }
  );
}

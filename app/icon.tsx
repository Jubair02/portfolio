import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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

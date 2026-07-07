import { ImageResponse } from "next/og";
import { site, github } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(1000px circle at 20% 10%, #1a1440 0%, transparent 55%), radial-gradient(900px circle at 95% 90%, #2a0f3a 0%, transparent 55%), #07070b",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6d5efc 0%, #c026d3 100%)",
              borderRadius: 18,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {site.initials}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: 24,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#34d399",
              }}
            />
            Available for work
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.65)" }}>
            {`${site.name} · ${site.role}`}
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            I build fast, elegant web experiences.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>React · Next.js · TypeScript · .NET</span>
          <span>{`github.com/${github.username}`}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

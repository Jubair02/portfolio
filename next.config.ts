import type { NextConfig } from "next";
import { SERVER_ACTION_BODY_LIMIT } from "./lib/upload-limits";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Serve modern, smaller formats where the browser supports them.
    formats: ["image/avif", "image/webp"],
    // Allow Cloudinary-hosted uploads from the CMS.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Import only the icons/animations actually used, shrinking the bundle.
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Allow image uploads through Server Actions (default cap is 1 MB).
    // Kept in step with the upload limit the UI and the action enforce.
    serverActions: {
      bodySizeLimit: SERVER_ACTION_BODY_LIMIT,
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

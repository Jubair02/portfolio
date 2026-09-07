import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Session gate for the admin area (Next 16's `proxy`, formerly `middleware`).
 *
 * Uses the trimmed `authConfig` so this stays free of Node-only deps like
 * Prisma and bcrypt: it only verifies the JWT session cookie and lets the
 * panel layout load the real user.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect the admin area; skip Next internals and static assets.
  matcher: ["/admin/:path*"],
};

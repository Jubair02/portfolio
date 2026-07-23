import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: verifies the JWT session cookie only (no Node deps).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect the admin area; skip Next internals and static assets.
  matcher: ["/admin/:path*"],
};

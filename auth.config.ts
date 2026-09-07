import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Node-only deps like Prisma/bcrypt). Shared by the
 * middleware instance and the full server instance in auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isLoginPage = pathname === "/admin/login";
      const isAdminArea = pathname.startsWith("/admin");

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/admin", nextUrl));
        return true;
      }
      if (isAdminArea) return isLoggedIn; // redirects to signIn page when false
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      // Profile page calls unstable_update({ user: { name, email } }) after a save
      // so the topbar/sidebar reflect the change without a re-login.
      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") token.name = session.user.name;
        if (typeof session.user.email === "string") token.email = session.user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

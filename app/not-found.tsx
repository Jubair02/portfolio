import type { Metadata, Viewport } from "next";
import "./globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NotFoundPage } from "@/components/ui/404-page-not-found";
import { getSiteCopy } from "@/lib/data";
import { site } from "@/content/site";

export const metadata: Metadata = {
  // Renders outside both root layouts, so it needs its own base for the OG image URL.
  metadataBase: new URL(site.url),
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#07070b" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

// This app uses two root layouts — app/(site) and app/(admin) — so there is no
// app/layout.tsx to wrap the top-level not-found boundary. It has to render its
// own <html>/<body>, including the ThemeProvider, or the visitor's saved theme
// never gets applied here and the page renders light-only.
export default async function NotFound() {
  const { navItems } = await getSiteCopy();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NotFoundPage nav={navItems} />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { NotFoundPage } from "@/components/ui/404-page-not-found";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

// This app uses two root layouts — app/(site) and app/(admin) — so there is no
// app/layout.tsx to wrap the top-level not-found boundary. It has to render its
// own <html>/<body>.
export default function NotFound() {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <NotFoundPage />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "../globals.css";
import { site } from "@/content/site";
import { getSocialLinks, getSeo, getSiteSettings, getHero } from "@/lib/data";
import { normalizeSiteUrl } from "@/lib/site-url";
import { geistSans, geistMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BrandTokens } from "@/components/layout/BrandTokens";
import { Preloader } from "@/components/layout/Preloader";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeo(), getSiteSettings()]);
  // `normalizeSiteUrl` never throws: an unparseable value saved in Site
  // Settings would otherwise turn every public request into a 500.
  const url = normalizeSiteUrl(settings.siteUrl);
  const metadataBase = new URL(url);
  // A file-based opengraph-image is only picked up when `openGraph.images` is
  // absent — declaring the key as `undefined` suppressed it and left shares
  // with no preview. Point at the route explicitly instead.
  const ogImage = seo.ogImage || "/opengraph-image";
  return {
    metadataBase,
    title: { default: seo.siteTitle, template: `%s · ${site.name}` },
    description: seo.metaDescription,
    applicationName: `${site.name} Portfolio`,
    authors: [{ name: site.name, url: site.socials.github }],
    creator: site.name,
    keywords: seo.keywords,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: `${site.name} — Portfolio`,
      title: seo.siteTitle,
      description: seo.metaDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.metaDescription,
      creator: "@Jubair02",
      images: [ogImage],
    },
    // No `icons` here on purpose: the app/icon.tsx file convention always
    // wins over metadata, so it reads the SEO "Favicon" field itself.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "technology",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#07070b" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [socials, settings, hero] = await Promise.all([
    getSocialLinks(),
    getSiteSettings(),
    getHero(),
  ]);
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <BrandTokens
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-glow-lg"
          >
            Skip to content
          </a>
          <SmoothScroll>
            <Preloader />
            <AuroraBackground />
            <CustomCursor />
            <ScrollProgress />
            <Navbar
              brand={{
                name: hero.name,
                initials: hero.initials,
                logo: settings.logo,
              }}
              socials={socials}
            />
            <main id="main">{children}</main>
            <Footer
              hero={hero}
              socials={socials}
              footerText={settings.footerText}
              copyright={settings.copyright}
              logo={settings.logo}
            />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}

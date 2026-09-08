import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { HeroData, SocialLinkData } from "@/lib/data";
import { DataIcon, GithubIcon, LinkedinIcon } from "@/components/icons";
import { isIconName } from "@/lib/icon-names";
import { Mail, Phone, Globe } from "lucide-react";

function PlatformIcon({
  platform,
  icon,
}: {
  platform: string;
  icon?: string | null;
}) {
  const p = platform.toLowerCase();
  const cls = "size-[1.1rem]";
  // An explicit icon from the admin wins over the platform-derived default.
  if (isIconName(icon)) return <DataIcon name={icon} className={cls} />;
  if (p.includes("github")) return <GithubIcon className={cls} />;
  if (p.includes("linkedin")) return <LinkedinIcon className={cls} />;
  if (p.includes("email") || p.includes("mail")) return <Mail className={cls} />;
  if (p.includes("phone") || p.includes("tel")) return <Phone className={cls} />;
  return <Globe className={cls} />;
}

export function Footer({
  hero,
  socials,
  footerText,
  copyright,
  logo,
  nav,
}: {
  hero: HeroData;
  socials: SocialLinkData[];
  footerText?: string | null;
  copyright?: string | null;
  /** Site Settings logo — replaces the initials monogram when uploaded. */
  logo?: string | null;
  /** Admin → Site Copy → Navigation. */
  nav: { label: string; href: string }[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[color:var(--border)] pt-16">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-[color:var(--muted)] shadow-glow">
                  <Image
                    src={logo}
                    alt={`${hero.name} logo`}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                  />
                </span>
              ) : (
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground shadow-glow">
                  {hero.initials}
                </span>
              )}
              <span className="text-lg font-semibold tracking-tight">
                {hero.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {footerText ??
                `${site.role} building fast, elegant products for the web. Open to freelance work and full-time roles.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  aria-label={s.platform}
                  className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
                >
                  <PlatformIcon platform={s.platform} icon={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigate</h3>
            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={`/${item.href}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${hero.email}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {hero.email}
                </a>
              </li>
              <li className="text-muted-foreground">{hero.location}</li>
              {hero.availabilityOpen && (
                <li className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {hero.availabilityLabel}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Oversized watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none mt-12 select-none text-center text-[18vw] font-bold leading-none tracking-tighter text-transparent [background:linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent)] bg-clip-text sm:text-[16vw]"
        >
          {hero.firstName}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] py-7 text-sm text-muted-foreground sm:flex-row">
          <p>{copyright ?? `© ${year} ${hero.name}. All rights reserved.`}</p>
          {/* <p className="inline-flex items-center gap-1.5">
            Built with
            <span className="font-medium text-foreground">Next.js</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-foreground">Tailwind</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-foreground">Framer Motion</span>
          </p> */}
        </div>
      </div>
    </footer>
  );
}

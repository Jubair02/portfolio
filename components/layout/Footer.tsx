import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { HeroData, SocialLinkData } from "@/lib/data";
import { DataIcon, GithubIcon, LinkedinIcon } from "@/components/icons";
import { isIconName } from "@/lib/icon-names";
import { navHref } from "@/lib/nav";
import { ArrowUpRight, Mail, MapPin, Phone, Globe } from "lucide-react";

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

/** Group label. One register for every heading in the footer. */
function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
      {children}
    </h3>
  );
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
    <footer className="relative overflow-hidden border-t border-[color:var(--border)]">
      {/* Ambient wash, in the same language as the page backdrop. Static: the
          footer is a resting place, not somewhere to draw the eye with motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70 dark:opacity-50"
      >
        <div className="absolute -top-40 left-[8%] size-[30rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_65%)] blur-3xl" />
        <div className="absolute -top-48 right-[6%] size-[26rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent-2)_28%,transparent),transparent_65%)] blur-3xl" />
      </div>

      <div className="container-page relative">
        {/* ------------------------------------------------ The invitation.
            The footer's one job on every page that isn't the contact section:
            make the address impossible to miss. */}
        <div className="flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:gap-10 lg:py-16">
          <div className="min-w-0">
            <ColumnLabel>Get in touch</ColumnLabel>
            <a
              href={`mailto:${hero.email}`}
              className="group mt-4 inline-flex max-w-full items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-2xl lg:text-[1.75rem]"
            >
              <span className="break-words">{hero.email}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:size-6"
              />
            </a>
            {hero.location && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                {hero.location}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-start gap-5 md:items-end">
            {hero.availabilityOpen && (
              <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_color-mix(in_oklab,#10b981_22%,transparent)]"
                />
                {hero.availabilityLabel}
              </span>
            )}

            {socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                {socials.map((s) => (
                  <a
                    key={`${s.platform}-${s.url}`}
                    href={s.url}
                    target={s.url.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    aria-label={s.platform}
                    className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/50 text-muted-foreground transition-[color,border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/45 hover:bg-[color:var(--primary)]/10 hover:text-primary"
                  >
                    <PlatformIcon platform={s.platform} icon={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------ Identity + map. */}
        <div className="flex flex-col gap-10 border-t border-[color:var(--border)] py-11 md:flex-row md:items-start md:justify-between md:gap-16 lg:py-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl"
              aria-label={`${hero.name} — home`}
            >
              {logo ? (
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[color:var(--muted)] shadow-glow">
                  <Image
                    src={logo}
                    alt={`${hero.name} logo`}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                  />
                </span>
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground shadow-glow">
                  {hero.initials}
                </span>
              )}
              <span className="text-base font-semibold tracking-tight">
                {hero.name}
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {footerText ??
                `${site.role} building fast, elegant products for the web. Open to freelance work and full-time roles.`}
            </p>
          </div>

          {nav.length > 0 && (
            <nav aria-label="Footer" className="md:shrink-0">
              <ColumnLabel>Navigate</ColumnLabel>
              {/* Two short columns instead of one long ladder — the list reads
                  as a block at every width rather than a scrolling column. */}
              <ul className="mt-4 grid w-fit grid-cols-2 gap-x-12 gap-y-1">
                {nav.map((item) => (
                  <li key={item.href} className="min-w-0">
                    <a
                      href={navHref(item.href)}
                      className="inline-block py-2 text-sm text-muted-foreground underline-offset-4 decoration-[color:var(--primary)]/40 transition-colors hover:text-foreground hover:underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* ------------------------------------------------ Legal.
            Trailing space keeps the copyright clear of the floating
            back-to-top button, which is fixed to the viewport corner. */}
        <div className="border-t border-[color:var(--border)] py-6 pe-14 sm:pe-20">
          <p className="text-xs text-muted-foreground sm:text-sm">
            {copyright ?? `© ${year} ${hero.name}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

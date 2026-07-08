import { nav, site } from "@/content/site";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[color:var(--border)] pt-16">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground shadow-glow">
                {site.initials}
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {site.name}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.role} building fast, elegant products for the web. Open to
              freelance work and full-time roles.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={site.socials.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
              >
                <GithubIcon className="size-[1.1rem]" />
              </a>
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
              >
                <LinkedinIcon className="size-[1.1rem]" />
              </a>
              <a
                href={site.socials.email}
                aria-label="Email"
                className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
              >
                <Mail className="size-[1.1rem]" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigate</h3>
            <ul className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
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
                  href={site.socials.email}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {site.email}
                </a>
              </li>
              <li className="text-muted-foreground">{site.location}</li>
              {site.availability.open && (
                <li className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Available for work
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
          {site.firstName}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] py-7 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
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

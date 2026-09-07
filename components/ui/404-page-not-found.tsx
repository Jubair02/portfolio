import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";
import { site, nav } from "@/content/site";
import { Button } from "@/components/ui/Button";

/**
 * On-brand 404. Uses the site's design tokens (so it follows light/dark) and
 * ships no third-party assets — the artwork is the same gradient/grid language
 * as the hero, drawn in CSS.
 */
export function NotFoundPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-24 text-foreground">
      {/* Backdrop: grid + brand glows, faded out toward the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-pattern [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_65%)] blur-3xl animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[12%] size-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-2)_18%,transparent),transparent_65%)] blur-3xl animate-float"
      />

      <div className="relative w-full max-w-2xl text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:border-[color:var(--primary)]/40 hover:text-foreground"
        >
          <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-2 text-[0.6rem] font-bold text-primary-foreground">
            {site.initials}
          </span>
          {site.name}
        </Link>

        <p className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Compass className="size-4 text-primary" aria-hidden="true" />
          Error 404
        </p>

        <h1 className="text-gradient-brand mt-3 text-[5.5rem] font-bold leading-none tracking-tighter sm:text-[8rem]">
          404
        </h1>

        <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          This page took a wrong turn
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          The link may be broken, or the page might have been moved. Everything
          else is still right where you left it.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" size="md">
            <Home className="size-4" aria-hidden="true" />
            Back to home
          </Button>
          <Button href="/#work" variant="secondary" size="md">
            See my work
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <nav
          aria-label="Site sections"
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[color:var(--border)] pt-8 text-sm"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={`/${item.href}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

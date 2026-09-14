import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Star } from "lucide-react";
import { getProject, getProjects } from "@/lib/data";
import { Eyebrow } from "@/components/ui/Section";
import { DataIcon, GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// Saving a project in the admin revalidates this segment; the window keeps
// anything missed fresh within a minute.
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      url: `/projects/${slug}`,
      images: project.image ? [project.image] : undefined,
    },
    twitter: {
      card: project.image ? "summary_large_image" : "summary",
      title: project.title,
      description: project.description,
      images: project.image ? [project.image] : undefined,
    },
  };
}

/** Pre-render the published projects that exist at build time. */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }));
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { links, metrics, screenshots } = project;

  return (
    <article className="container-page pb-24 pt-32 sm:pt-36">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All projects
        </Link>

        {/* Header */}
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>{project.tagline}</Eyebrow>
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)]/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-black">
                <Star className="size-3 fill-current" aria-hidden="true" />
                Featured
              </span>
            )}
            {project.year && (
              <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
            )}
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {(links.demo || links.github) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {links.demo && (
                <a
                  href={links.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Live demo
                  <ArrowUpRight className="size-4" />
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-[color:var(--primary)]/50 hover:text-foreground"
                >
                  <GithubIcon className="size-4" />
                  View the code
                </a>
              )}
            </div>
          )}
        </header>

        {/* Cover */}
        <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-[color:var(--border)]">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} — ${project.tagline}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 56rem"
              className="object-cover object-top"
            />
          ) : (
            <>
              <div className={cn("absolute inset-0 bg-gradient-to-br", project.gradient)} />
              <div className="dot-pattern absolute inset-0 opacity-20 mix-blend-overlay" />
              <DataIcon
                name={project.icon}
                className="absolute -bottom-8 -right-6 size-56 text-white/15"
              />
            </>
          )}
        </div>

        {/* Case study */}
        {project.caseStudy && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">How it was built</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              {project.caseStudy
                .split(/\n+/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </section>
        )}

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <section className="mt-12">
            <h2 className="sr-only">At a glance</h2>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="surface rounded-2xl border border-[color:var(--border)] px-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {m.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold">{m.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Screenshots */}
        {screenshots && screenshots.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">Screens</h2>
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
              {screenshots.map((src, i) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${project.title} screenshot ${i + 1} (opens full size)`}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[color:var(--border)] transition-transform hover:scale-[1.01]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 28rem"
                    className="object-cover object-top"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Tech */}
        {project.tech.length > 0 && (
          <section className="mt-14 border-t border-[color:var(--border)] pt-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Built with
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-1.5 text-sm font-medium text-foreground/75"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--border)] pt-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Browse all projects
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Work on something like this?
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

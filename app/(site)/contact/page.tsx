import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Clock, Quote, Star } from "lucide-react";
import {
  getHero,
  getSocialLinks,
  getSiteCopy,
  getServices,
  getTestimonials,
  type HeroData,
  type TestimonialData,
} from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { DataIcon } from "@/components/icons";
import { ContactForm } from "@/components/sections/ContactForm";
import { CopyEmail } from "@/components/sections/contact/CopyEmail";
import { cn } from "@/lib/utils";

// Same cadence as the home page; the admin copy and hero forms also
// revalidate this path directly.
export const revalidate = 60;

/** Offered as chips above the form; the pick becomes the message's subject. */
const TOPICS = ["New project", "Job opportunity", "Freelance / contract", "Just saying hi"];

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getSiteCopy();
  const description = copy.contact.description;
  return {
    title: "Contact",
    description,
    alternates: { canonical: "/contact" },
    // Without its own block the page inherits the home page's Open Graph tags,
    // so a shared /contact link would preview as the home page.
    openGraph: { type: "website", title: "Contact", description, url: "/contact" },
    twitter: { card: "summary_large_image", title: "Contact", description },
  };
}

function buildContactJsonLd(hero: HeroData, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${hero.name}`,
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "Person",
      name: hero.name,
      jobTitle: hero.role,
      email: hero.email,
      url: siteUrl,
    },
  };
}

/** The strongest review leads; ties keep the admin's ordering. */
function pickFeatured(list: TestimonialData[]): TestimonialData | null {
  return list.reduce<TestimonialData | null>(
    (best, t) => (!best || t.rating > best.rating ? t : best),
    null
  );
}

/** The response-time promise is admin-edited copy, so it is quoted verbatim. */
function buildSteps(responseTime: string) {
  return [
    {
      title: "Send a note",
      description:
        "A few lines about what you're building, the role, or the problem you're stuck on. Rough is fine.",
    },
    {
      title: "You hear back",
      description: `Typical response time: ${responseTime}. I'll come back with questions, or a time to talk.`,
    },
    {
      title: "We scope it together",
      description:
        "A clear plan, an honest estimate and no surprises — before any code is written.",
    },
  ];
}

function InfoCard({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="surface flex items-center gap-4 rounded-3xl p-5">
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl",
          tone === "emerald" ? "bg-emerald-500/12 text-emerald-500" : "bg-primary/12 text-primary"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

/**
 * The dedicated contact page behind every "Let's talk" button.
 *
 * The home page keeps its contact band for visitors already scrolling; this
 * page is for the ones who arrived to write. Everything on it is the same
 * admin-edited data the home band uses, plus the services and a review as
 * context for someone who landed here without seeing the rest of the site.
 */
export default async function ContactPage() {
  const [hero, socials, copy, services, testimonials, siteUrl] = await Promise.all([
    getHero(),
    getSocialLinks(),
    getSiteCopy(),
    getServices(),
    getTestimonials(),
    getSiteUrl(),
  ]);
  const { contact } = copy;
  const featured = pickFeatured(testimonials);
  const steps = buildSteps(contact.responseTime);

  return (
    <div className="container-page pb-24 pt-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildContactJsonLd(hero, siteUrl)) }}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>

      {/* ------------------------------------------------------------ Header */}
      <header className="mt-8 max-w-3xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>{contact.eyebrow}</Eyebrow>
            {hero.availabilityOpen && (
              <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 py-1.5 pl-2.5 pr-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                {hero.availabilityLabel}
              </span>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {contact.title}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {contact.description}
          </p>
        </Reveal>
      </header>

      {/* ------------------------------------------------ Channels + form */}
      <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* Left rail: the direct channels, and what happens after you write. */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="surface card-hover relative overflow-hidden rounded-3xl p-5 hover:border-[color:var(--primary)]/40 sm:p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_35%,transparent),transparent_70%)] blur-2xl"
              />
              <div className="relative flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Mail className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${hero.email}`}
                    className="group mt-1 inline-flex max-w-full items-center gap-2 text-lg font-semibold tracking-tight transition-colors hover:text-primary sm:text-xl"
                  >
                    <span className="break-all">{hero.email}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </a>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    The fastest way to reach me — no form required.
                  </p>
                </div>
              </div>
              <div className="relative mt-5 flex flex-wrap gap-2">
                <a
                  href={`mailto:${hero.email}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-glow transition-[transform,box-shadow,filter] duration-300 hover:shadow-glow-lg hover:brightness-110 active:scale-[0.97]"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  Open mail app
                </a>
                <CopyEmail email={hero.email} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<MapPin className="size-5" />} label="Based in" value={hero.location} />
              <InfoCard
                icon={<Clock className="size-5" />}
                label="Response time"
                value={contact.responseTime}
                tone="emerald"
              />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="surface rounded-3xl p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                What happens next
              </p>
              <ol className="mt-4 space-y-4">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="pt-0.5 font-mono text-xs text-primary">0{i + 1}</span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {socials.length > 0 && (
            <Reveal delay={0.18}>
              <div className="flex flex-wrap items-center gap-3 px-1 pt-2">
                <span className="text-sm text-muted-foreground">Or find me on</span>
                <SocialIcons links={socials} className="gap-3" />
              </div>
            </Reveal>
          )}
        </aside>

        {/* The form. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-10 inset-x-0 -z-10 overflow-hidden"
          >
            <div className="animate-float absolute right-4 top-0 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_70%)] opacity-40 blur-2xl" />
            <div className="animate-float-slow absolute -bottom-4 left-6 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-2)_40%,transparent),transparent_70%)] opacity-30 blur-2xl" />
          </div>
          <Reveal direction="left" delay={0.1}>
            <div className="glass-strong shadow-glow-lg rounded-4xl p-6 sm:p-8 lg:p-10">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Send a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  It goes straight to my inbox, and I read every one.
                </p>
              </div>
              <ContactForm topics={TOPICS} />
            </div>
          </Reveal>
        </div>
      </div>

      {/* ------------------------------------------------- What I take on */}
      {services.length > 0 && (
        <section className="mt-24 lg:mt-32" aria-labelledby="help-heading">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>What I can help with</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                id="help-heading"
                className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl"
              >
                Bring the problem. Leave with a plan.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Not sure what to ask for? These are the kinds of work I take on most often.
              </p>
            </Reveal>
          </div>
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <RevealItem key={service.title} className="h-full">
                <article className="surface card-hover group relative h-full overflow-hidden rounded-3xl p-6 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary transition-transform duration-300 group-hover:scale-105">
                    <DataIcon name={service.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  {service.features.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((feature) => (
                        <li
                          key={feature}
                          className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/50 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* --------------------------------------------------- Social proof */}
      {featured && (
        <section className="mt-24 lg:mt-32" aria-label="Client review">
          <Reveal>
            <figure className="glass relative overflow-hidden rounded-4xl p-8 sm:p-12 lg:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%)] blur-3xl"
              />
              <Quote aria-hidden="true" className="size-8 text-primary/60" />
              <blockquote className="mt-5 max-w-3xl text-xl font-medium leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem]">
                &ldquo;{featured.review}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-4">
                {featured.image ? (
                  <Image
                    src={featured.image}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-2 text-sm font-semibold text-primary-foreground">
                    {featured.initials ?? featured.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold">{featured.name}</p>
                  {(featured.designation || featured.company) && (
                    <p className="text-sm text-muted-foreground">
                      {[featured.designation, featured.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div
                  role="img"
                  aria-label={`${featured.rating} out of 5 stars`}
                  className="flex items-center gap-0.5 sm:ml-auto"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={cn(
                        "size-4",
                        i < featured.rating ? "fill-gold text-gold" : "text-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        </section>
      )}
    </div>
  );
}

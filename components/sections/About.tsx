import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { about, site } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { DataIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow={about.eyebrow}
        title={about.title}
        align="center"
        className="mx-auto text-center"
      />

      <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Story + portrait */}
        <div className="flex flex-col gap-8">
          <Reveal direction="right">
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)]">
              <Image
                src="/jubair-portrait.webp"
                alt={site.name}
                width={640}
                height={480}
                sizes="(max-width: 1024px) 100vw, 34rem"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold text-white drop-shadow">
                    {site.name}
                  </p>
                  <p className="text-sm text-white/80 drop-shadow">
                    {site.role}
                  </p>
                </div>
                <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-white">
                  {site.location}
                </span>
              </div>
            </div>
          </Reveal>

          <div className="space-y-4">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.06 * i} direction="up">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <Button href={site.resumeUrl} variant="secondary" size="md">
              Download résumé
              <ArrowUpRight className="size-4" />
            </Button>
          </Reveal>
        </div>

        {/* Values */}
        <div>
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
              What I value
            </p>
          </Reveal>
          <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2">
            {about.values.map((v) => (
              <RevealItem key={v.title}>
                <div className="card-hover surface group h-full rounded-3xl p-6 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent-2/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <DataIcon name={v.icon} className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.15}>
            <div className="surface mt-4 flex items-center gap-4 rounded-3xl p-6">
              <div className="text-4xl">🚀</div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Currently sharpening my skills in{" "}
                <span className="font-medium text-foreground">
                  system design
                </span>
                ,{" "}
                <span className="font-medium text-foreground">
                  TypeScript
                </span>{" "}
                and{" "}
                <span className="font-medium text-foreground">
                  cloud deployment
                </span>{" "}
                — always learning, always building.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

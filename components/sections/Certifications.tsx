import Image from "next/image";
import type { CertificateData } from "@/lib/data";
import type { Achievement, SectionCopy } from "@/lib/schemas/site-copy";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { DataIcon } from "@/components/icons";

export function Certifications({
  certificates,
  heading,
  achievements,
}: {
  certificates: CertificateData[];
  heading: SectionCopy;
  achievements: Achievement[];
}) {
  if (certificates.length === 0) return null;
  return (
    <Section id="certifications" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />

      <div className={cn("mt-14 grid gap-6", achievements.length > 0 && "lg:grid-cols-[1.2fr_1fr]")}>
        {/* Certifications */}
        <div>
          <RevealGroup className="grid gap-4 sm:grid-cols-2">
            {certificates.map((c, i) => {
              const inner = (
                <div className="card-hover surface group flex h-full flex-col overflow-hidden rounded-3xl hover:border-[color:var(--primary)]/40 hover:shadow-glow">
                  {c.image && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[color:var(--border)]">
                      <Image
                        src={c.image}
                        alt={`${c.title} certificate`}
                        fill
                        sizes="(max-width: 640px) 100vw, 30vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex grow items-start gap-4 p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent-2/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <DataIcon name={c.icon} className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold leading-snug">{c.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.organization} · {c.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
              return (
                <RevealItem key={`${c.title}-${i}`}>
                  {c.credentialUrl ? (
                    <a href={c.credentialUrl} target="_blank" rel="noreferrer noopener">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>

        {/* Achievements — hidden when the admin leaves the panel empty */}
        {achievements.length > 0 && (
        <Reveal direction="left">
          <div className="surface relative h-full overflow-hidden rounded-3xl p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent-2/15 blur-2xl" />
            <h3 className="relative text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
              By the numbers
            </h3>
            <ul className="relative mt-5 space-y-4">
              {achievements.map((a) => (
                <li key={a.label} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color:var(--muted)]/60 text-primary">
                    <DataIcon name={a.icon} className="size-5" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {a.label}
                  </span>
                  <span className="ml-auto text-xl font-bold tracking-tight">
                    {a.metric}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        )}
      </div>
    </Section>
  );
}

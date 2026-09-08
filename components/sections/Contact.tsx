import { Mail, MapPin, Clock } from "lucide-react";
import type { HeroData, SocialLinkData } from "@/lib/data";
import type { ContactCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";
import { SocialIcons } from "@/components/ui/SocialIcons";

export function Contact({
  hero,
  socials,
  copy,
}: {
  hero: HeroData;
  socials: SocialLinkData[];
  copy: ContactCopy;
}) {
  return (
    <Section id="contact" className="border-t border-[color:var(--border)]">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Info */}
        <div>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />

          <Reveal delay={0.1}>
            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${hero.email}`}
                className="card-hover surface group flex items-center gap-4 rounded-2xl p-4 hover:border-[color:var(--primary)]/40"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Email me at</p>
                  <p className="font-medium">{hero.email}</p>
                </div>
              </a>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{hero.location}</p>
                  </div>
                </div>
                <div className="surface flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Response</p>
                    <p className="text-sm font-medium">
                      {copy.responseTime}
                    </p>
                  </div>
                </div>
              </div>

              {socials.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">
                    Or find me on
                  </span>
                  <SocialIcons links={socials} className="gap-3" />
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Form */}
        <div className="relative">
          {/* Floating background shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden"
          >
            <div className="animate-float absolute right-2 top-0 size-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_70%)] opacity-40 blur-2xl" />
            <div className="animate-float-slow absolute -bottom-2 left-4 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-2)_40%,transparent),transparent_70%)] opacity-30 blur-2xl" />
          </div>
          <Reveal direction="left" delay={0.1}>
            <div className="glass-strong shadow-glow rounded-4xl p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

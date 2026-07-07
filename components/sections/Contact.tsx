import { Mail, MapPin, Clock } from "lucide-react";
import { contact, site } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";
import { GithubIcon, LinkedinIcon } from "@/components/icons";

export function Contact() {
  return (
    <Section id="contact" className="border-t border-[color:var(--border)]">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Info */}
        <div>
          <SectionHeading
            eyebrow={contact.eyebrow}
            title={contact.title}
            description={contact.description}
          />

          <Reveal delay={0.1}>
            <div className="mt-8 space-y-3">
              <a
                href={site.socials.email}
                className="card-hover surface group flex items-center gap-4 rounded-2xl p-4 hover:border-[color:var(--primary)]/40"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Email me at</p>
                  <p className="font-medium">{site.email}</p>
                </div>
              </a>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{site.location}</p>
                  </div>
                </div>
                <div className="surface flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/12 text-emerald-500">
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Response</p>
                    <p className="text-sm font-medium">
                      {contact.responseTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-muted-foreground">
                  Or find me on
                </span>
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
              </div>
            </div>
          </Reveal>
        </div>

        {/* Form */}
        <Reveal direction="left" delay={0.1}>
          <div className="glass-strong shadow-glow rounded-4xl p-6 sm:p-8">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

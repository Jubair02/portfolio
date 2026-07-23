import type { ServiceData } from "@/lib/data";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DataIcon } from "@/components/icons";

export function Services({ services }: { services: ServiceData[] }) {
  return (
    <Section id="services" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow="Services"
        title="How I can help"
        description="Whether you're a founder validating an idea or a team that needs an extra pair of expert hands — here's what I bring to the table."
        align="center"
        className="mx-auto text-center"
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.title} delay={0.05 * (i % 3)}>
            <div className="card-hover surface group relative h-full overflow-hidden rounded-3xl p-7 hover:-translate-y-1 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
              {/* hover glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent-2/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <DataIcon name={service.icon} className="size-6" />
                </span>
                <span className="font-mono text-sm text-muted-foreground/50">
                  0{i + 1}
                </span>
              </div>

              <h3 className="relative mt-5 text-lg font-semibold">
                {service.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <div className="relative mt-5 flex flex-wrap gap-2">
                {service.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs font-medium text-foreground/70"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

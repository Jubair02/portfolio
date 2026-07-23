import { CheckCircle2, MapPin } from "lucide-react";
import type { ExperienceData, EducationData } from "@/lib/data";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DataIcon } from "@/components/icons";

type TimelineEntry = {
  key: string;
  icon: string;
  period: string;
  location?: string | null;
  title: string;
  org: string;
  highlights: string[];
  tags: string[];
};

export function Experience({
  experience,
  education,
}: {
  experience: ExperienceData[];
  education: EducationData[];
}) {
  const entries: TimelineEntry[] = [
    ...experience.map((e, i) => ({
      key: `exp-${i}`,
      icon: e.icon,
      period: e.duration,
      location: e.location,
      title: e.position,
      org: e.company,
      highlights: e.highlights,
      tags: e.tags,
    })),
    ...education.map((e, i) => ({
      key: `edu-${i}`,
      icon: e.icon,
      period: e.duration,
      location: null,
      title: e.degree,
      org: e.institute,
      highlights: e.result ? [`Result: ${e.result}`] : [],
      tags: [],
    })),
  ];

  return (
    <Section id="experience" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow="Journey"
        title="Experience & education"
        description="The path so far — a mix of building in the open, client work, and formal study."
      />

      <ol className="relative mt-14 ml-4 space-y-6 border-l border-[color:var(--border)] pl-8 sm:ml-5 sm:pl-10">
        {entries.map((item, i) => (
          <li key={item.key} className="relative">
            <span className="absolute -left-[3.05rem] top-0 grid size-9 place-items-center rounded-full border border-[color:var(--border)] bg-background text-primary shadow-glow sm:-left-[3.55rem]">
              <DataIcon name={item.icon as never} className="size-4" />
            </span>
            <Reveal direction="up" delay={0.04 * i}>
              <div className="card-hover surface rounded-3xl p-6 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                    {item.period}
                  </span>
                  {item.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {item.location}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{item.org}</p>
                {item.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((h, hi) => (
                      <li key={hi} className="flex gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-2.5 py-1 text-xs font-medium text-foreground/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

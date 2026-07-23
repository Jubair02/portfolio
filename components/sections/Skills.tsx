"use client";

import { motion, useReducedMotion } from "framer-motion";
import { techMarquee } from "@/content/site";
import type { SkillCategoryData } from "@/lib/data";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DataIcon } from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;

function SkillBar({ name, level }: { name: string; level: number }) {
  const reduce = useReducedMotion();
  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground/90">{name}</span>
        <span className="font-mono text-xs text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--muted)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent-2 to-accent"
          initial={{ width: reduce ? `${level}%` : 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, ease }}
        />
      </div>
    </li>
  );
}

export function Skills({ categories }: { categories: SkillCategoryData[] }) {
  return (
    <Section id="skills" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow="Skills"
        title="A modern, full-stack toolkit"
        description="Battle-tested technologies I use to design, build, and ship products end to end."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Reveal key={cat.title} delay={0.08 * i}>
            <div className="card-hover surface border-animated group relative h-full rounded-3xl p-7 hover:border-[color:var(--primary)]/40 hover:shadow-glow">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-11 animate-float-slow place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent-2/10 text-primary shadow-[0_0_0_0_transparent] transition-shadow duration-500 group-hover:shadow-[0_8px_24px_-6px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
                  style={{ animationDelay: `${i * 0.7}s` }}
                >
                  <DataIcon name={cat.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{cat.title}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {cat.blurb}
              </p>
              <ul className="mt-6 space-y-4">
                {cat.skills.map((s) => (
                  <SkillBar key={s.name} name={s.name} level={s.level} />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Tech marquee */}
      <div className="mask-fade-x relative mt-12 flex overflow-hidden">
        <div className="animate-marquee pause-hover flex shrink-0 items-center gap-3 pr-3">
          {[...techMarquee, ...techMarquee].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-4 py-2 text-sm font-medium text-foreground/80"
            >
              <span className="size-1.5 rounded-full bg-gradient-to-r from-primary to-accent-2" />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

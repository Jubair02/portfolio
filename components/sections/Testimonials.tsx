"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials() {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (next: number, direction: number) => {
      setState([(next + count) % count, direction]);
    },
    [count]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(index + 1, 1), 6500);
    return () => clearInterval(id);
  }, [index, paused, go]);

  const active = testimonials[index];

  return (
    <Section id="testimonials" className="border-t border-[color:var(--border)]">
      <SectionHeading
        eyebrow="Testimonials"
        title="Kind words from people I've worked with"
        align="center"
        className="mx-auto text-center"
      />

      <div
        className="relative mx-auto mt-14 max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="glass-strong shadow-glow relative overflow-hidden rounded-4xl p-8 sm:p-12">
          <Quote className="absolute right-8 top-8 size-16 text-primary/10" />
          <div className="relative min-h-[13rem] sm:min-h-[11rem]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir >= 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir >= 0 ? -40 : 40 }}
                transition={{ duration: 0.45, ease }}
                aria-live="polite"
              >
                <p className="text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
                  “{active.quote}”
                </p>
                <footer className="mt-7 flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground">
                    {active.initials}
                  </span>
                  <div>
                    <div className="font-semibold">{active.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {active.title} · {active.company}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => go(index - 1, -1)}
            className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-[color:var(--muted-foreground)]/30 hover:bg-[color:var(--muted-foreground)]/60"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => go(index + 1, 1)}
            className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </Section>
  );
}

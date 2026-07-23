"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import type { TestimonialData } from "@/lib/data";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials({ testimonials }: { testimonials: TestimonialData[] }) {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const count = testimonials.length;

  // Auto-rotation stops under reduced-motion, on hover/focus, or when the
  // visitor explicitly pauses it (WCAG 2.2.2 Pause/Stop/Hide).
  const playing = !reduce && !manualPaused && !hoverPaused && count > 1;

  const go = useCallback(
    (next: number, direction: number) => {
      setState([(next + count) % count, direction]);
    },
    [count]
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => go(index + 1, 1), 6500);
    return () => clearInterval(id);
  }, [index, playing, go]);

  if (count === 0) return null;
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
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocusCapture={() => setHoverPaused(true)}
        onBlurCapture={() => setHoverPaused(false)}
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
              >
                <p className="text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
                  “{active.review}”
                </p>
                <footer className="mt-7 flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground">
                    {active.initials || active.name.charAt(0)}
                  </span>
                  <div>
                    <div className="font-semibold">{active.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {[active.designation, active.company].filter(Boolean).join(" · ")}
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

          {!reduce && count > 1 && (
            <button
              type="button"
              aria-label={
                manualPaused
                  ? "Play testimonials automatically"
                  : "Pause automatic rotation"
              }
              aria-pressed={manualPaused}
              onClick={() => setManualPaused((v) => !v)}
              className="ml-1 grid size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
            >
              {manualPaused ? (
                <Play className="size-4" />
              ) : (
                <Pause className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

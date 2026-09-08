"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Star } from "lucide-react";
import type { TestimonialData } from "@/lib/data";
import type { SectionCopy } from "@/lib/schemas/site-copy";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Direction-aware slide. These have to be variants rather than inline props:
 * AnimatePresence only forwards its `custom` value to variant resolvers, so an
 * inline `exit={{ x: dir ... }}` would exit using whatever direction was
 * current when that slide first mounted.
 */
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -40 : 40 }),
};

/** Five stars with `rating` filled, announced once for screen readers. */
function Rating({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      className="mt-5 flex items-center gap-1"
      role="img"
      aria-label={`Rated ${filled} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-4",
            i < filled
              ? "fill-[color:var(--gold)] text-[color:var(--gold)]"
              : "text-[color:var(--muted-foreground)]/35"
          )}
        />
      ))}
    </div>
  );
}

export function Testimonials({
  testimonials,
  heading,
}: {
  testimonials: TestimonialData[];
  heading: SectionCopy;
}) {
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
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description || undefined}
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
            {/* popLayout, not "wait": the outgoing quote leaves the layout flow
                and the incoming one mounts immediately, so the slides cross
                over. With mode="wait" the card sat blank for the full 0.45s
                exit before the next quote appeared. */}
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.blockquote
                key={index}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease }}
                className="w-full"
              >
                {active.rating > 0 && <Rating rating={active.rating} />}
                <p className="mt-4 text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
                  “{active.review}”
                </p>
                <footer className="mt-7 flex items-center gap-4">
                  {active.image ? (
                    <Image
                      src={active.image}
                      alt={active.name}
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-full object-cover ring-2 ring-[color:var(--primary)]/25"
                    />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground">
                      {active.initials || active.name.charAt(0)}
                    </span>
                  )}
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

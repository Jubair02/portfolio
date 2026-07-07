"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

export function Preloader() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show only once per browser tab session.
    const seen =
      typeof window !== "undefined" && sessionStorage.getItem("jh_preloaded");
    if (seen || reduce) {
      // Client-only decision (sessionStorage / reduced-motion) — must run after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    document.body.style.overflow = "hidden";
    let raf = 0;
    const start = performance.now();
    const duration = 1300;

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out for a natural fill
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setLoading(false), 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = "";
      if (typeof window !== "undefined")
        sessionStorage.setItem("jh_preloaded", "1");
    }
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          aria-hidden="true"
        >
          <div className="grid-pattern absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,#000,transparent_70%)]" />

          <div className="relative flex flex-col items-center">
            {/* Monogram with pulsing ring */}
            <div className="relative grid size-20 place-items-center">
              <motion.span
                className="absolute inset-0 rounded-2xl border border-primary/40"
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent-2 text-2xl font-bold text-primary-foreground shadow-glow-lg"
                initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {site.initials}
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="mt-8 h-0.5 w-44 overflow-hidden rounded-full bg-[color:var(--muted)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-accent-2 to-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex w-44 items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono tracking-widest uppercase">
                Loading
              </span>
              <span className="font-mono tabular-nums">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

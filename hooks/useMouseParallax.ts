"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

type Parallax = {
  /** Normalized, spring-smoothed mouse offset from viewport center (-1 … 1). */
  x: MotionValue<number>;
  y: MotionValue<number>;
};

/**
 * Tracks the pointer as a spring-smoothed, normalized offset from the center
 * of the viewport. Multiply the returned values by a pixel strength to drive
 * subtle parallax. No-ops for touch / reduced-motion users.
 */
export function useMouseParallax(stiffness = 120, damping = 22): Parallax {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping, mass: 0.5 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    // Skip on touch-only devices — no meaningful pointer to track.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduce]);

  return { x, y };
}

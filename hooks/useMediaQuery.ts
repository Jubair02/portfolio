"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Returns `false` on the server and during the
 * first client render, then syncs to the real value after mount (avoids
 * hydration mismatches).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the user prefers reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on devices with a precise pointer (mouse/trackpad) — i.e. not touch. */
export function usePointerFine(): boolean {
  return useMediaQuery("(pointer: fine)");
}

/** True at the `lg` breakpoint and up (desktop-class layouts). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

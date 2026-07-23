"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const LenisContext = createContext<Lenis | null>(null);

/** Access the active Lenis instance (null when smooth scroll is disabled). */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/**
 * Scroll helper that works whether or not Lenis is active.
 * Falls back to native scrolling for reduced-motion / touch users.
 */
export function smoothScrollTo(
  lenis: Lenis | null,
  target: string | number | HTMLElement,
  offset = -80
) {
  if (lenis) {
    lenis.scrollTo(target, { offset });
    return;
  }
  // Native fallback
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "auto" });
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Respect reduced motion — keep fully native, accessible scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.05,
      // easeOutExpo — natural, decisive settle
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Leave touch scrolling native (best feel + accessibility on mobile).
    });
    // Publish the Lenis instance (external system) to consumers via context.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    const loop = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Smooth in-page anchor links + keep the URL hash / history in sync.
  useEffect(() => {
    if (!lenis) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || anchor.dataset.lenisPrevent) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
      // Preserve browser history + shareable hash without a jump.
      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

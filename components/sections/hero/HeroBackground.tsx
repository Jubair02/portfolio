"use client";

import dynamic from "next/dynamic";
import { motion, useTransform } from "framer-motion";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ParticleField } from "./ParticleField";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import {
  useIsDesktop,
  usePointerFine,
  usePrefersReducedMotion,
} from "@/hooks/useMediaQuery";

// WebGL scene is code-split and never included in the initial bundle.
const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

/** Silently drops the 3D layer if WebGL init fails — page keeps working. */
class SafeCanvas extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HeroBackground() {
  const reduce = usePrefersReducedMotion();
  const desktop = useIsDesktop();
  const pointerFine = usePointerFine();
  const [show3D, setShow3D] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const { x, y } = useMouseParallax(90, 20);
  const blobX = useTransform(x, (v) => v * 26);
  const blobY = useTransform(y, (v) => v * 26);
  const sceneX = useTransform(x, (v) => v * 16);
  const sceneY = useTransform(y, (v) => v * 16);
  const dotX = useTransform(x, (v) => v * 10);
  const dotY = useTransform(y, (v) => v * 10);

  // Mount the WebGL scene only on capable devices, and only once idle.
  useEffect(() => {
    if (reduce || !desktop || !pointerFine) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow3D(false);
      return;
    }
    const conn = (
      navigator as unknown as { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) return;

    const ric: (cb: () => void) => number =
      window.requestIdleCallback?.bind(window) ??
      ((cb) => window.setTimeout(cb, 700));
    const cancel: (h: number) => void =
      window.cancelIdleCallback?.bind(window) ?? window.clearTimeout;

    const handle = ric(() => setShow3D(true));
    return () => cancel(handle);
  }, [reduce, desktop, pointerFine]);

  // Pause the WebGL render loop while the hero is off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Soft glow blobs (mouse parallax) */}
      <motion.div style={{ x: blobX, y: blobY }} className="absolute inset-0">
        <div className="absolute left-[8%] top-[14%] size-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_50%,transparent),transparent_65%)] opacity-40 blur-3xl dark:opacity-30" />
        <div className="absolute right-[6%] top-[8%] size-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-2)_45%,transparent),transparent_65%)] opacity-30 blur-3xl dark:opacity-25" />
        <div className="absolute bottom-[6%] left-[38%] size-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_42%,transparent),transparent_65%)] opacity-25 blur-3xl dark:opacity-20" />
      </motion.div>

      {/* 3D scene */}
      {show3D && (
        <motion.div
          style={{ x: sceneX, y: sceneY }}
          className="absolute inset-0 opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.2 }}
        >
          <SafeCanvas>
            <Hero3D active={inView} />
          </SafeCanvas>
        </motion.div>
      )}

      {/* Particle field */}
      {!reduce && (
        <motion.div style={{ x: dotX, y: dotY }} className="absolute inset-0">
          <ParticleField className="size-full opacity-70" />
        </motion.div>
      )}
    </div>
  );
}

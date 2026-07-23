"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const INTERACTIVE =
  'a, button, input, textarea, select, label, [role="button"], [data-cursor="hover"]';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  // Dot follows instantly; ring follows via spring for a trailing feel.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    // One-time capability gate — enable custom cursor after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onOver = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(INTERACTIVE)) setHovering(true);
    };
    const onOut = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.(INTERACTIVE)) setHovering(false);
    };
    const onDown = (e: PointerEvent) => {
      setDown(true);
      spawnRipple(e.clientX, e.clientY);
    };
    const onUp = () => setDown(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[300] block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s" }}
    >
      {/* Ring follower (theme-aware: contrasts in both light & dark) */}
      <motion.div
        className="absolute left-0 top-0 rounded-full border-[1.5px] border-[color:var(--foreground)]"
        style={{ x: ringX, y: ringY, width: 34, height: 34, marginLeft: -17, marginTop: -17 }}
        animate={{
          scale: down ? 0.8 : hovering ? 2.3 : 1,
          opacity: hovering ? 0.8 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
      {/* Center dot */}
      <motion.div
        className="absolute left-0 top-0 rounded-full bg-[color:var(--foreground)]"
        style={{ x, y, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5 }}
        animate={{ scale: hovering ? 0 : down ? 0.6 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </div>
  );
}

/** Lightweight DOM ripple at click position (self-cleaning, CSS-animated). */
function spawnRipple(clientX: number, clientY: number) {
  const el = document.createElement("span");
  el.className = "cursor-ripple";
  el.style.left = `${clientX}px`;
  el.style.top = `${clientY}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
  // Safety net in case animationend doesn't fire.
  window.setTimeout(() => el.remove(), 900);
}

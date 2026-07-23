import type { PointerEvent } from "react";

/**
 * Spawns a material-style ripple inside the target element at the click point.
 * The element must be `position: relative` and `overflow: hidden`.
 * Self-cleaning; safe to attach to any button via `onPointerDown`.
 */
export function createRipple(e: PointerEvent<HTMLElement>) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement("span");
  span.className = "btn-ripple";
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${e.clientX - rect.left}px`;
  span.style.top = `${e.clientY - rect.top}px`;
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove(), { once: true });
  window.setTimeout(() => span.remove(), 800);
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount guard prevents SSR/client theme hydration mismatch (next-themes pattern).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        "relative grid size-10 place-items-center overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/50 text-foreground/80 transition-colors hover:text-foreground hover:bg-[color:var(--muted)] " +
        (className ?? "")
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ y: 14, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -14, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute grid place-items-center"
          >
            {isDark ? (
              <Sun className="size-[1.15rem]" />
            ) : (
              <Moon className="size-[1.15rem]" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

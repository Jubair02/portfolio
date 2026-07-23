"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { smoothScrollTo, useLenis } from "@/components/providers/SmoothScroll";

const sectionIds = nav.map((n) => n.href.replace("#", ""));

export function Navbar() {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock scroll (and pause Lenis) when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  // Focus management for the mobile menu: move focus in, trap Tab, close on
  // Escape, and restore focus to the toggle when it closes.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[95] flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={cn(
          "flex w-full items-center justify-between rounded-full pl-4 transition-all duration-300",
          scrolled
            ? "glass-strong shadow-glow max-w-5xl scale-[0.99] px-3 py-2 sm:px-4"
            : "max-w-6xl border border-transparent bg-transparent px-3 py-2.5 sm:px-4"
        )}
      >
        {/* Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            smoothScrollTo(lenis, 0);
          }}
          className="group flex items-center gap-2.5"
          aria-label={`${site.name} — home`}
        >
          <span
            className={cn(
              "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-2 font-bold text-primary-foreground shadow-glow transition-all duration-300 group-hover:scale-105",
              scrolled ? "size-8 text-xs" : "size-9 text-sm"
            )}
          >
            {site.initials}
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            {site.name}
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const isActive = active === item.href.replace("#", "");
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group/navlink relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[color:var(--muted)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                  <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 rounded-full bg-gradient-to-r from-primary to-accent-2 transition-transform duration-300 group-hover/navlink:scale-x-100" />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="hidden size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/50 text-foreground/80 transition-colors hover:text-foreground sm:grid"
          >
            <GithubIcon className="size-[1.15rem]" />
          </a>
          <ThemeToggle className="hidden sm:grid" />
          <div className="hidden lg:block">
            <Button href="#contact" size="sm" magnetic>
              Let&apos;s talk
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/50 text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-0 z-[-1] lg:hidden"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-3 mt-20 rounded-3xl border border-[color:var(--border)] bg-card p-6 shadow-glow-lg"
            >
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.05 }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-foreground/90 transition-colors hover:bg-[color:var(--muted)] hover:text-foreground"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        0{i + 1}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-5">
                <div className="flex items-center gap-2">
                  <a
                    href={site.socials.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="GitHub"
                    className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/80"
                  >
                    <GithubIcon className="size-5" />
                  </a>
                  <a
                    href={site.socials.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="LinkedIn"
                    className="grid size-10 place-items-center rounded-full border border-[color:var(--border)] text-foreground/80"
                  >
                    <LinkedinIcon className="size-5" />
                  </a>
                  <ThemeToggle />
                </div>
                <Button href="#contact" size="sm" onClick={() => setOpen(false)}>
                  Let&apos;s talk
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

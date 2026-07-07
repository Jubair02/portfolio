"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Copy, Check, Sparkles } from "lucide-react";
import { site, stats } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { GithubIcon, LinkedinIcon } from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;

function RoleRotator() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % site.roles.length),
      2600
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex h-[1.2em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className="text-gradient-brand whitespace-nowrap"
        >
          {site.roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function EmailCopy() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(site.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="group inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Copy email address"
    >
      {site.email}
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yImage = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease },
    },
  };

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 sm:pt-32"
    >
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Left */}
          <motion.div
            style={{ y: yText, opacity: fade }}
            variants={container}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-2xl"
          >
            {/* Availability */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/50 py-1.5 pl-2.5 pr-4 text-sm font-medium text-foreground/80 backdrop-blur">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                {site.availability.label}
              </span>
            </motion.div>

            {/* Greeting */}
            <motion.p
              variants={item}
              className="mt-7 text-base font-medium text-muted-foreground sm:text-lg"
            >
              Hi, I&apos;m {site.name} 👋
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="mt-3 text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.1rem]"
            >
              I build{" "}
              <span className="text-gradient-brand">fast, elegant</span> web
              experiences.
            </motion.h1>

            {/* Rotating role */}
            <motion.div
              variants={item}
              className="mt-5 text-xl font-medium sm:text-2xl"
            >
              <span className="text-muted-foreground">A </span>
              <RoleRotator />
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={item}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {site.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button href="#work" size="lg">
                View my work
                <ArrowUpRight className="size-4" />
              </Button>
              <Button href="#contact" variant="secondary" size="lg">
                Get in touch
              </Button>
            </motion.div>

            {/* Meta row */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <EmailCopy />
              <div className="flex items-center gap-2">
                <a
                  href={site.socials.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="GitHub"
                  className="grid size-9 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
                >
                  <GithubIcon className="size-4" />
                </a>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="LinkedIn"
                  className="grid size-9 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50"
                >
                  <LinkedinIcon className="size-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — portrait */}
          <motion.div
            style={{ y: yImage }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            {/* Glow ring */}
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-accent-2/20 to-accent/30 opacity-70 blur-2xl" />

            <div className="glass-strong shadow-glow-lg relative overflow-hidden rounded-[2rem] p-2">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/jubair-portrait.jpg"
                  alt={`Portrait of ${site.name}, ${site.role}`}
                  width={560}
                  height={560}
                  priority
                  sizes="(max-width: 1024px) 24rem, 28rem"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Floating stat cards */}
            <motion.div
              className="glass-strong shadow-glow absolute -left-5 top-10 hidden rounded-2xl px-4 py-3 sm:block"
              animate={reduce ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none">
                    <Counter value={20} suffix="+" />
                  </p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass-strong shadow-glow absolute -right-4 bottom-12 hidden rounded-2xl px-4 py-3 sm:block"
              animate={reduce ? {} : { y: [0, 10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-2/15 text-accent-2">
                  <GithubIcon className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none">
                    <Counter value={24} suffix="" />
                  </p>
                  <p className="text-xs text-muted-foreground">Repositories</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.dl
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--border)] sm:mt-20 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-1 bg-background px-4 py-6 text-center"
            >
              <dd className="text-3xl font-bold tracking-tight sm:text-4xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
              <dt className="text-xs text-muted-foreground sm:text-sm">
                {s.label}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Scroll hint */}
      <motion.a
        href="#about"
        aria-label="Scroll to about"
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground lg:flex"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}

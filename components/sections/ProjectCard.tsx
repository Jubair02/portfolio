"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { Project } from "@/content/site";
import { TiltCard } from "@/components/ui/TiltCard";
import { DataIcon, GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <TiltCard max={5} className="group h-full rounded-3xl">
      <article className="surface border-animated relative flex h-full flex-col overflow-hidden rounded-3xl transition-[border-color,box-shadow,transform] duration-400 group-hover:-translate-y-1 group-hover:border-[color:var(--primary)]/40 group-hover:shadow-glow-lg">
        {/* Cover */}
        <div className="relative h-44 overflow-hidden">
          {project.image ? (
            <>
              {/* Real screenshot, zooming on hover */}
              <Image
                src={project.image}
                alt={`${project.title} — ${project.tagline}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Darken toward the bottom so the title stays legible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            </>
          ) : (
            <>
              {/* Zooming gradient (image-zoom feel) */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-transform duration-700 ease-out group-hover:scale-110",
                  project.gradient
                )}
              />
              <div className="dot-pattern absolute inset-0 opacity-20 mix-blend-overlay" />
              {/* Glow sheen on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <DataIcon
                name={project.icon}
                className="absolute -bottom-6 -right-4 size-40 text-white/15 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
              />
            </>
          )}
          <div className="relative flex items-center justify-between p-5">
            <span className="glass rounded-full px-3 py-1 text-xs font-medium text-white">
              {project.tagline}
            </span>
            <span className="font-mono text-xs text-white/85">
              {String(index + 1).padStart(2, "0")} · {project.year}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 p-5">
            <h3 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="flex grow flex-col p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {/* Case study preview */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            {open ? "Hide case study" : "Read the case study"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                open && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-3 rounded-2xl bg-[color:var(--muted)]/50 p-4 text-sm leading-relaxed text-muted-foreground">
                  {project.caseStudy}
                </p>
                {project.metrics && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {project.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-[color:var(--border)] px-3 py-2"
                      >
                        <p className="text-xs text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="text-sm font-semibold">{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tech */}
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-2.5 py-1 text-xs font-medium text-foreground/75"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-auto flex items-center gap-2 pt-6">
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                Live demo
                <ArrowUpRight className="size-4" />
              </a>
            )}
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${project.title} source on GitHub`}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--border)] px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-[color:var(--primary)]/50 hover:text-foreground",
                !project.links.demo && "flex-1"
              )}
            >
              <GithubIcon className="size-4" />
              Code
            </a>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

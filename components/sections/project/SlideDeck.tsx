"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Presentation } from "lucide-react";
import type { ProjectDeck } from "@/content/site";
import { pdfPageUrl, pdfThumbUrl } from "@/lib/pdf-slides";
import { cn } from "@/lib/utils";

/**
 * Slide-by-slide viewer for an uploaded PDF.
 *
 * Every slide is just an image rendered by Cloudinary, so no PDF library is
 * shipped to the visitor. Only the current slide is rendered; the next one is
 * warmed in the background so paging feels instant.
 */
export function SlideDeck({ deck, title }: { deck: ProjectDeck; title: string }) {
  const [page, setPage] = useState(1);
  const last = deck.pages;

  const go = useCallback(
    (next: number) => setPage(Math.min(last, Math.max(1, next))),
    [last]
  );

  // Warm the neighbouring slides so paging doesn't flash.
  useEffect(() => {
    for (const n of [page + 1, page - 1]) {
      if (n >= 1 && n <= last) {
        const img = new window.Image();
        img.src = pdfPageUrl(deck.url, n);
      }
    }
  }, [page, last, deck.url]);

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Presentation className="size-5 text-primary" aria-hidden="true" />
          {deck.label || "Slides"}
        </h2>
        <a
          href={deck.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
        >
          <Download className="size-4" />
          Download the PDF
        </a>
      </div>

      {/* Stage. Focusable so the arrow keys work once it is tabbed to. */}
      <div
        tabIndex={0}
        role="group"
        aria-label={`${title} slides, ${last} in total`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(page + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(page - 1); }
        }}
        className="surface relative mt-5 overflow-hidden rounded-3xl border border-[color:var(--border)] outline-none focus-visible:border-[color:var(--primary)]"
      >
        <div className="relative aspect-[16/10] bg-[color:var(--muted)]/40">
          <Image
            key={page}
            src={pdfPageUrl(deck.url, page)}
            alt={`${title} — slide ${page} of ${last}`}
            fill
            sizes="(max-width: 768px) 100vw, 56rem"
            className="object-contain"
            priority={page === 1}
            unoptimized
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] px-3 py-2.5">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page === 1}
            aria-label="Previous slide"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50 disabled:opacity-40 disabled:hover:border-[color:var(--border)]"
          >
            <ChevronLeft className="size-5" />
          </button>

          <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
            {page} / {last}
          </p>

          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page === last}
            aria-label="Next slide"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-[color:var(--border)] text-foreground/70 transition-colors hover:text-foreground hover:border-[color:var(--primary)]/50 disabled:opacity-40 disabled:hover:border-[color:var(--border)]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails, for decks short enough that a strip stays useful. */}
      {last > 1 && last <= 30 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: last }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              aria-label={`Go to slide ${n}`}
              aria-current={n === page}
              className={cn(
                "relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border transition-colors",
                n === page
                  ? "border-[color:var(--primary)]"
                  : "border-[color:var(--border)] opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={pdfThumbUrl(deck.url, n)}
                alt=""
                fill
                sizes="6rem"
                className="object-contain"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

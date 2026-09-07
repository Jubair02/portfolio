"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches failures in a root layout itself, which is the
 * one case a segment `error.tsx` cannot handle.
 *
 * This app has two root layouts — app/(site) and app/(admin) — so there is no
 * app/layout.tsx above this file. It must render its own <html>/<body>.
 * Deliberately self-contained: no Tailwind, no fonts, no providers. Whatever
 * broke may well be one of those, and a fallback that depends on the thing it
 * is meant to survive is no fallback at all. Hence the inline styles and the
 * prefers-color-scheme media query in place of the class-based dark mode.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-root {
            --ge-bg: #ffffff;
            --ge-fg: #0a0a0f;
            --ge-muted: #565d6b;
            --ge-border: #e6e7ec;
            --ge-accent: #6d5efc;
            --ge-accent-fg: #ffffff;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: var(--ge-bg);
            color: var(--ge-fg);
            font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          }
          @media (prefers-color-scheme: dark) {
            .ge-root {
              --ge-bg: #07070b;
              --ge-fg: #f3f3f6;
              --ge-muted: #9d9dad;
              --ge-border: #20202b;
              --ge-accent: #8b7dff;
              --ge-accent-fg: #0a0a0f;
            }
          }
          .ge-card { max-width: 32rem; text-align: center; }
          .ge-title { margin: 0 0 8px; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.01em; }
          .ge-text { margin: 0 0 24px; color: var(--ge-muted); }
          .ge-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
          .ge-btn {
            display: inline-block; padding: 10px 20px; border-radius: 10px;
            font-size: 0.875rem; font-weight: 500; cursor: pointer;
            border: 1px solid var(--ge-accent); background: var(--ge-accent);
            color: var(--ge-accent-fg); text-decoration: none;
          }
          .ge-btn--ghost { background: transparent; border-color: var(--ge-border); color: var(--ge-fg); }
          .ge-digest {
            margin: 24px 0 0; font-size: 0.75rem; color: var(--ge-muted);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }
        `}</style>
        <div className="ge-root">
          <div className="ge-card">
            <h1 className="ge-title">Something went wrong</h1>
            <p className="ge-text">
              The page failed to load. Trying again usually clears it — if not,
              head back home and give it a minute.
            </p>
            <div className="ge-actions">
              <button type="button" className="ge-btn" onClick={() => reset()}>
                Try again
              </button>
              {/* A plain anchor on purpose: the React tree has already failed
                  here, so a full document load is what actually recovers the
                  app. next/link would attempt a client-side navigation with
                  the very router that just broke. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="ge-btn ge-btn--ghost">
                Go home
              </a>
            </div>
            {error.digest && (
              <p className="ge-digest">Reference: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

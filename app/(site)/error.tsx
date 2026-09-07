"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Boundary for the public site. Kept plain and dependency-light so it renders
 * even when the failure came from the heavier client work below it (3D hero,
 * smooth scrolling), and styled with the design tokens the site layout has
 * already loaded.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] page error:", error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Something broke
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          This section failed to load
        </h1>
        <p className="mt-4 text-muted-foreground">
          That&apos;s on my end, not yours. Give it another try, or head back to
          the top of the page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}

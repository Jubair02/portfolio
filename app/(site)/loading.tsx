/**
 * Suspense fallback for the public site while its database-backed content
 * streams in. Intentionally near-empty: the layout already renders a Preloader
 * over the top, so anything more would show through as a second, competing
 * loading state.
 */
export default function SiteLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" aria-busy>
      <span className="sr-only">Loading…</span>
      <span className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

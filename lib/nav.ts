/**
 * Navigation targets are stored as either "#section" (a band on the home page)
 * or "/page" (a real route). Kept dependency-free so the public Navbar and
 * Footer can import it without pulling zod into the client bundle.
 */

/**
 * Targets that used to be bands on the home page and are now their own route.
 *
 * Saved nav items and hero CTAs still hold the old anchor, and rewriting them
 * on read keeps those links working without a data migration — and without
 * risking the all-or-nothing fallback in `getSiteCopy`.
 */
const MOVED_TARGETS: Record<string, string> = {
  "#contact": "/contact",
};

/** Rewrite a stored target if the section behind it has become a page. */
export function resolveNavTarget(href: string): string {
  return MOVED_TARGETS[href] ?? href;
}

/** True for on-page section anchors, false for routes like "/projects". */
export function isSectionAnchor(href: string): boolean {
  return href.startsWith("#");
}

/**
 * The href to render. Section anchors are prefixed with "/" so they still work
 * from a sub-page (on /projects, "#about" must be "/#about" to go home first).
 */
export function navHref(href: string): string {
  return isSectionAnchor(href) ? `/${href}` : href;
}

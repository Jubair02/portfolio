/**
 * Navigation targets are stored as either "#section" (a band on the home page)
 * or "/page" (a real route). Kept dependency-free so the public Navbar and
 * Footer can import it without pulling zod into the client bundle.
 */

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

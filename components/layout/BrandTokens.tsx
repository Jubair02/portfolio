/**
 * Applies the Primary/Accent colors set in admin → Site Settings.
 *
 * The palette lives in CSS custom properties (see app/globals.css), so a brand
 * override is just a later rule redefining `--primary` / `--accent`. Both the
 * light (`:root`) and dark (`:root.dark`) themes are overridden — the admin
 * offers one color per role, not one per theme — and `:root.dark` outranks the
 * `.dark` block it replaces, so the override holds after a theme switch.
 *
 * Renders nothing when neither color is set, leaving the defaults untouched.
 */

/** Accepts only literal CSS colors, so admin input can't break out of the rule. */
function safeColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  const ok =
    /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
    /^(rgb|hsl|oklch|oklab)a?\([0-9a-z.,%/\s-]+\)$/i.test(v) ||
    /^[a-z]{3,20}$/i.test(v); // named colors, e.g. "rebeccapurple"
  return ok ? v : null;
}

export function BrandTokens({
  primaryColor,
  accentColor,
}: {
  primaryColor?: string | null;
  accentColor?: string | null;
}) {
  const primary = safeColor(primaryColor);
  const accent = safeColor(accentColor);
  if (!primary && !accent) return null;

  const decls = [
    primary && `--primary:${primary};--ring:${primary};`,
    accent && `--accent:${accent};`,
  ]
    .filter(Boolean)
    .join("");

  return (
    <style
      // Same declarations for both themes: Site Settings has a single pair of
      // colors, and `:root.dark` is specific enough to beat globals.css.
      dangerouslySetInnerHTML={{ __html: `:root{${decls}}:root.dark{${decls}}` }}
    />
  );
}

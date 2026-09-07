/**
 * The only icon keys the site can render. `iconMap` in components/icons.tsx is
 * typed as `Record<IconName, ...>`, so adding a name here without wiring up the
 * component (or vice versa) fails the build instead of silently falling back to
 * Sparkles at runtime.
 */
export const ICON_NAMES = [
  "BadgeCheck",
  "Braces",
  "Briefcase",
  "Calendar",
  "Code2",
  "Database",
  "Gauge",
  "GitBranch",
  "GraduationCap",
  "Layers",
  "MonitorSmartphone",
  "Palette",
  "Rocket",
  "Server",
  "ShieldCheck",
  "Sparkles",
  "Star",
  "Trophy",
  "Wrench",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && (ICON_NAMES as readonly string[]).includes(value);
}

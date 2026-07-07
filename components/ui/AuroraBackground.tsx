/**
 * Ambient page backdrop: soft animated gradient blobs + a faint grid.
 * Pure CSS animation (no JS), fixed behind all content.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Faint grid */}
      <div className="grid-pattern absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />

      {/* Gradient blobs */}
      <div className="animate-float-slow absolute -top-40 -left-32 size-[38rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_60%)] opacity-40 blur-3xl dark:opacity-30" />
      <div className="animate-float absolute top-1/3 -right-40 size-[34rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent-2)_40%,transparent),transparent_60%)] opacity-30 blur-3xl dark:opacity-25" />
      <div className="animate-float-slow absolute -bottom-40 left-1/4 size-[32rem] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_40%,transparent),transparent_60%)] opacity-25 blur-3xl dark:opacity-20" />

      {/* Vignette to keep edges calm */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--background))]" />
    </div>
  );
}

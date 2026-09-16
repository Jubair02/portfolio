import { CirclePlay } from "lucide-react";
import { toEmbedUrl } from "@/lib/video";

/**
 * Walkthrough video. The link is stored as the editor pasted it and converted
 * to a player URL here; an unrecognised link renders nothing rather than an
 * empty frame.
 */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const src = toEmbedUrl(url);
  if (!src) return null;

  return (
    <section className="mt-14">
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <CirclePlay className="size-5 text-primary" aria-hidden="true" />
        Walkthrough
      </h2>
      <div className="relative mt-5 aspect-video overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--muted)]/40">
        <iframe
          src={src}
          title={`${title} — video walkthrough`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    </section>
  );
}

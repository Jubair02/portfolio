/**
 * Video links for project pages.
 *
 * Editors paste whatever link they copied from the address bar; this turns the
 * common YouTube and Vimeo shapes into a URL an iframe can actually load, and
 * returns null for anything it does not recognise so the form can reject it
 * rather than rendering a broken player.
 *
 * YouTube embeds use the nocookie host, which does not set tracking cookies
 * until the visitor presses play.
 */
export function toEmbedUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");
  const youtubeId = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
  const vimeoId = (id: string) => `https://player.vimeo.com/video/${id}`;

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? youtubeId(id) : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const watch = url.searchParams.get("v");
    if (watch) return youtubeId(watch);
    // /embed/ID, /shorts/ID and /live/ID all carry the id in the path.
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]+)/);
    return match ? youtubeId(match[1]) : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? vimeoId(id) : null;
  }

  return null;
}

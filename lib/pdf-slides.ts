/**
 * Slide rendering for uploaded PDFs.
 *
 * Cloudinary can rasterise any page of a PDF that was uploaded as an *image*
 * resource, so a deck is shown page by page as ordinary images. That keeps the
 * viewer free of a PDF rendering library — nothing extra is downloaded by the
 * visitor, and each slide is a normal cacheable image request.
 *
 * Deliberately dependency-free so client components can import it.
 */

/** Largest page we ever request; the browser scales it down to the container. */
const DEFAULT_WIDTH = 1600;

/**
 * URL of a single page of the deck, as a JPEG.
 *
 * `pg_<n>` selects the page, `f_auto,q_auto` let Cloudinary pick the best
 * format and compression for the requesting browser.
 */
export function pdfPageUrl(secureUrl: string, page: number, width = DEFAULT_WIDTH): string {
  return secureUrl
    .replace("/upload/", `/upload/pg_${page},f_auto,q_auto,w_${width}/`)
    .replace(/\.pdf($|\?)/i, ".jpg$1");
}

/** Small version of a page, for the thumbnail strip. */
export function pdfThumbUrl(secureUrl: string, page: number): string {
  return pdfPageUrl(secureUrl, page, 320);
}

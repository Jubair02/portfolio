import { z } from "zod";

/**
 * Shared URL validation for admin-entered links.
 *
 * Every value validated here ends up in an `href` on the public site, so the
 * check is deliberately a real `new URL()` parse plus a protocol allow-list
 * rather than a loose pattern: it rejects the near-misses editors actually
 * type ("github.com/me", "www.example.com") *and* refuses `javascript:` and
 * `data:` links, which would otherwise be rendered straight into an anchor.
 */

function protocolOf(value: string): string | null {
  try {
    return new URL(value).protocol;
  } catch {
    return null;
  }
}

const WEB = ["http:", "https:"];
/** Social links legitimately include email and phone entries. */
const CONTACT = [...WEB, "mailto:", "tel:"];

const WEB_MESSAGE = "Enter a full URL starting with https:// — e.g. https://example.com";
const CONTACT_MESSAGE =
  "Enter a full https:// URL, or a mailto: / tel: link for email and phone.";

/** A full absolute http(s) URL. */
export const httpUrlSchema = z
  .string()
  .trim()
  .refine((v) => WEB.includes(protocolOf(v) ?? ""), WEB_MESSAGE);

/** An http(s), mailto: or tel: link. */
export const contactUrlSchema = z
  .string()
  .trim()
  .refine((v) => CONTACT.includes(protocolOf(v) ?? ""), CONTACT_MESSAGE);

/**
 * Same as `httpUrlSchema` but treats an empty string as "not set", which is
 * how the admin forms represent a cleared optional field (the actions map ""
 * back to NULL before it reaches the database).
 */
export const optionalHttpUrlSchema = z
  .union([z.literal(""), httpUrlSchema])
  .optional();

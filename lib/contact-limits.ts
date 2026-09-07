/**
 * Shared contract for the public contact form.
 *
 * Deliberately zod-free: the client form imports these caps for its
 * `maxLength` attributes, and pulling the validation library into the public
 * bundle for three numbers isn't worth the bytes. The API is the enforcement
 * point (see lib/schemas/contact.ts); these constants exist so the two can
 * never drift apart.
 */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
} as const;

/** Minimum message length, matched by the client-side hint. */
export const CONTACT_MESSAGE_MIN = 10;

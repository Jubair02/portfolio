/**
 * Shared contract for the public contact form.
 *
 * Deliberately zod-free: the client form imports these caps for its
 * `maxLength` attributes and its inline validation, and pulling the validation
 * library into the public bundle isn't worth the bytes. The API is the
 * enforcement point (see lib/schemas/contact.ts); everything here is shared by
 * both sides so the two can never drift apart.
 */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
} as const;

/** Minimum message length, matched by the client-side hint. */
export const CONTACT_MESSAGE_MIN = 10;

/* -------------------------------------------------------------------------- */
/* Email                                                                      */
/* -------------------------------------------------------------------------- */

/** Local part: dot-separated atoms, so no leading, trailing or doubled dot. */
const ATOM = "[\\p{L}\\p{N}!#$%&'*+/=?^_`{|}~-]+";
/** Domain label: must start and end alphanumerically, hyphens only inside. */
const LABEL = "[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]*[\\p{L}\\p{N}])?";

/**
 * A pragmatic address check, deliberately stricter than the usual
 * "something@something.something", which happily accepts `a@b..com`,
 * `a@b.com.`, `a@-b.com` and `.a@b.com`.
 *
 * The address must end in a real top-level domain of two or more letters, so
 * `a@b` and `a@b.c` are rejected too. Letters are matched by Unicode property
 * rather than A-Z, so international addresses such as ada@münchen.de pass.
 *
 * It does not attempt full RFC 5322 — quoted local parts, comments and IP
 * literals are vanishingly rare on a contact form, and the cost of getting
 * them wrong is turning away a real person.
 */
export const EMAIL_PATTERN = new RegExp(
  `^${ATOM}(?:\\.${ATOM})*@${LABEL}(?:\\.${LABEL})*\\.\\p{L}{2,}$`,
  "u"
);

/**
 * Why an address is unacceptable, or null when it is fine.
 *
 * Each message names the specific problem instead of saying "invalid", so the
 * visitor knows what to change rather than having to guess.
 */
export function emailError(value: string): string | null {
  const email = value.trim();

  if (!email) return "Please enter your email address.";
  if (/\s/.test(email)) return "An email address can't contain spaces.";
  if (email.length > CONTACT_LIMITS.email) {
    return `That address is too long — ${CONTACT_LIMITS.email} characters at most.`;
  }

  const parts = email.split("@");
  if (parts.length === 1) return "Add an @ — for example ada@example.com.";
  if (parts.length > 2) return "An email address can only contain one @.";

  const [local, domain] = parts;
  if (!local) return "Add the part before the @ — for example ada@example.com.";
  if (!domain) return "Add the part after the @ — for example ada@example.com.";
  if (!domain.includes(".")) {
    return "Add the domain ending, such as .com — for example ada@example.com.";
  }

  return EMAIL_PATTERN.test(email)
    ? null
    : "That doesn't look like a valid email address.";
}

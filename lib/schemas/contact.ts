import { z } from "zod";
import {
  CONTACT_LIMITS,
  CONTACT_MESSAGE_MIN,
  EMAIL_PATTERN,
} from "@/lib/contact-limits";

/**
 * Server-side contract for POST /api/contact.
 *
 * The email rule is the same pattern the form checks against, so an address
 * the visitor was told to fix can't slip through by posting directly.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_LIMITS.name),
  email: z.string().trim().min(3).max(CONTACT_LIMITS.email).regex(EMAIL_PATTERN),
  message: z.string().trim().min(CONTACT_MESSAGE_MIN).max(CONTACT_LIMITS.message),
  /** Honeypot: hidden from humans, so anything here is a bot. */
  website: z.string().max(CONTACT_LIMITS.name).optional(),
});

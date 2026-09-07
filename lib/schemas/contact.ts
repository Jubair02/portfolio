import { z } from "zod";
import { CONTACT_LIMITS, CONTACT_MESSAGE_MIN } from "@/lib/contact-limits";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Server-side contract for POST /api/contact. */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_LIMITS.name),
  email: z.string().trim().min(3).max(CONTACT_LIMITS.email).regex(emailRe),
  message: z.string().trim().min(CONTACT_MESSAGE_MIN).max(CONTACT_LIMITS.message),
  /** Honeypot: hidden from humans, so anything here is a bot. */
  website: z.string().max(CONTACT_LIMITS.name).optional(),
});

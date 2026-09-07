import { auth } from "@/auth";

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** The session was missing or expired, so the UI can offer a way back in. */
  sessionExpired?: boolean;
};

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Sign in again, then save your changes.";

/** The signed-in admin, or null when the session is missing or expired. */
export async function getAdmin() {
  const session = await auth();
  return session?.user ?? null;
}

export function sessionExpiredResult(): ActionResult {
  return { ok: false, error: SESSION_EXPIRED_MESSAGE, sessionExpired: true };
}

/**
 * Guard for the top of a Server Action: returns null when the caller is a
 * signed-in admin, otherwise a result the action should return as-is.
 *
 * Returning rather than throwing is the point. A throw inside a Server Action
 * reaches the browser as an opaque digest and trips the nearest error
 * boundary, so a session that quietly expired mid-edit used to blow away the
 * admin screen — and the unsaved form with it. Returning keeps the form
 * mounted and lets the client show "sign in again" next to the Save button.
 */
export async function adminGuard(): Promise<ActionResult | null> {
  return (await getAdmin()) ? null : sessionExpiredResult();
}

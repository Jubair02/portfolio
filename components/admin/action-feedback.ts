"use client";

import { toast } from "sonner";
import type { ActionResult } from "@/lib/auth-guard";

/**
 * Call a Server Action without letting a transport failure escape as an
 * unhandled rejection.
 *
 * Actions themselves now return errors rather than throwing, but the request
 * can still fail outside the action: a dropped connection, or a body larger
 * than `serverActions.bodySizeLimit`, which Next rejects before the action
 * runs. Unhandled, either one tears down the admin screen through the error
 * boundary; caught here, it is just a toast over a form that still holds the
 * user's work.
 */
export async function runAction(
  call: () => Promise<ActionResult>
): Promise<ActionResult> {
  try {
    return await call();
  } catch (err) {
    console.error("[action] request failed:", err);
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

/** Report a failed action, giving an expired session a way back in. */
export function toastActionError(res: ActionResult, fallback = "Something went wrong.") {
  const message = res.error ?? fallback;
  if (!res.sessionExpired) {
    toast.error(message);
    return;
  }
  toast.error(message, {
    duration: 10_000,
    action: {
      label: "Sign in",
      // A new tab keeps the half-filled form in this one alive: the editor
      // signs in beside it and comes back to hit Save again.
      onClick: () => window.open("/admin/login", "_blank", "noopener,noreferrer"),
    },
  });
}

import type { ZodError } from "zod";

/** Shown when a save is rejected and the offending fields are highlighted. */
export const FIX_FIELDS_MESSAGE = "Please fix the highlighted fields.";

/**
 * Turn a Zod error into `ActionResult.fieldErrors` — a flat map of field name
 * to message that the admin forms render next to the matching input.
 *
 * Keys are dotted paths ("metrics.0.label"), matching how react-hook-form
 * names nested fields. The first issue per field wins: showing one clear
 * message per input beats stacking several on the same field.
 */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!key || key in fieldErrors) continue;
    fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

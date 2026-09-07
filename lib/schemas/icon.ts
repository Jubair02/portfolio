import { z } from "zod";
import { ICON_NAMES } from "@/lib/icon-names";

/**
 * Icons are a closed set (see lib/icon-names.ts). Validating server-side means
 * a bad name can't reach the database through a stale form or a direct action
 * call and then silently render as Sparkles.
 */
export const iconNameSchema = z.enum(ICON_NAMES, {
  message: "Pick one of the available icons.",
});

/** For fields where no icon is a valid choice. */
export const optionalIconNameSchema = z.union([
  iconNameSchema,
  z.literal(""),
]);

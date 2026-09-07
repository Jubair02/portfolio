/**
 * Single source of truth for image-upload size limits.
 *
 * Three places have to agree or uploads fail confusingly: the client-side
 * pre-check, the Server Action that receives the file, and the Server Action
 * body cap in next.config.ts. When the config cap was lower than the file cap,
 * files between the two limits were rejected by the framework before the action
 * ever ran, so the user only saw a generic "something went wrong".
 *
 * Imported by next.config.ts, so this module must stay free of any runtime
 * dependency (no "server-only", no env access, no Node/browser APIs).
 */

/** Largest image an editor may upload. */
export const MAX_UPLOAD_MB = 8;

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** Human-readable form used in UI copy and error messages. */
export const MAX_UPLOAD_LABEL = `${MAX_UPLOAD_MB} MB`;

/**
 * Cap for `experimental.serverActions.bodySizeLimit`.
 *
 * Must exceed MAX_UPLOAD_MB: the request body carries the file plus the
 * multipart boundaries, part headers and the other form fields. Next's docs
 * suggest 10-20 KB of overhead for a typical upload; a whole megabyte of
 * headroom keeps the *file* size the only limit an editor can actually hit,
 * so the friendly in-app message always wins over the framework's rejection.
 */
export const SERVER_ACTION_BODY_LIMIT = `${MAX_UPLOAD_MB + 1}mb`;

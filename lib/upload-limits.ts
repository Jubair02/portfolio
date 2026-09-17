/**
 * Single source of truth for upload size limits.
 *
 * Files no longer travel through the server: the browser posts them straight
 * to Cloudinary with a short-lived signature (see lib/cloudinary-upload.ts),
 * so neither Next's Server Action body cap nor Vercel's 4.5 MB request-body
 * cap applies to them any more. The only ceiling left is Cloudinary's own
 * per-file limit, which is what MAX_UPLOAD_MB tracks.
 *
 * Imported by next.config.ts, so this module must stay free of any runtime
 * dependency (no "server-only", no env access, no Node/browser APIs).
 */

/**
 * Largest file an editor may upload.
 *
 * 10 MB is the per-file ceiling on Cloudinary's free plan; paid plans allow
 * more. Raise this after upgrading the account and every enforcement point
 * follows: the client pre-check, the post-upload verification and the UI copy
 * all read it.
 */
export const MAX_UPLOAD_MB = 10;

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** Human-readable form used in UI copy and error messages. */
export const MAX_UPLOAD_LABEL = `${MAX_UPLOAD_MB} MB`;

/**
 * Cap for `experimental.serverActions.bodySizeLimit`.
 *
 * Deliberately unrelated to MAX_UPLOAD_MB now that files bypass the server.
 * Server Actions only carry form text and, after an upload, a Cloudinary
 * public id, so this exists purely to buy headroom over Next's 1 MB default
 * for long-form project copy. It stays well under Vercel's 4.5 MB platform
 * cap, which no config value can raise.
 */
export const SERVER_ACTION_BODY_LIMIT = "2mb";

"use server";

import { revalidatePath } from "next/cache";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";
import { contentBackupSchema, restoreContentBackup, summarize } from "@/lib/content-transfer";

const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export type ImportResult = ActionResult & { summary?: Record<string, number> };

/** Replace all content with an uploaded backup file. */
export async function importContentAction(formData: FormData): Promise<ImportResult> {
  const denied = await adminGuard();
  if (denied) return denied;

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (file.size > MAX_BACKUP_BYTES) return { ok: false, error: "Backup file is larger than 5 MB." };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  const parsed = contentBackupSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      ok: false,
      error: "This is not a portfolio content backup (or it was made by a different version).",
    };
  }

  try {
    await restoreContentBackup(parsed.data);
  } catch (err) {
    console.error("[import] restore failed, transaction rolled back:", err);
    return {
      ok: false,
      error: "Restore failed and nothing was changed. The file may contain fields this version does not know.",
    };
  }

  await logActivity("restored", "content backup", parsed.data.exportedAt ? `from ${parsed.data.exportedAt.slice(0, 10)}` : undefined);
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return { ok: true, summary: summarize(parsed.data) };
}

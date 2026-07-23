import { prisma } from "@/lib/prisma";

/** Best-effort audit log for the dashboard "Recent activity" feed. */
export async function logActivity(
  action: string,
  entity: string,
  detail?: string,
  entityId?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { action, entity, detail, entityId },
    });
  } catch {
    // Non-critical: never let logging break a mutation.
  }
}

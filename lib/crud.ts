import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminGuard, type ActionResult } from "@/lib/auth-guard";
import { FIX_FIELDS_MESSAGE, toFieldErrors } from "@/lib/form-errors";
import { logActivity } from "@/lib/activity";

type Delegate = {
  create(args: { data: Record<string, unknown> }): Promise<{ id: string }>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<{ id: string }>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  count(args?: unknown): Promise<number>;
  findMany(args?: unknown): Promise<{ id: string; order: number }[]>;
};

export type CrudConfig<T> = {
  model: string;
  entity: string;
  schema: ZodType<T>;
  toData: (v: T) => Record<string, unknown>;
  /** extra paths to revalidate (in addition to "/") */
  paths?: string[];
  /** field to show in the activity log */
  labelField?: keyof T;
};

function delegateFor(model: string): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[model];
}

function revalidate<T>(cfg: CrudConfig<T>) {
  revalidatePath("/");
  for (const p of cfg.paths ?? []) revalidatePath(p);
}

export async function crudCreate<T>(
  cfg: CrudConfig<T>,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = cfg.schema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };
  try {
    const delegate = delegateFor(cfg.model);
    // Append after the current last item. Using count() here handed out
    // duplicate positions once anything had been deleted.
    const [last] = await delegate.findMany({
      orderBy: { order: "desc" },
      take: 1,
      select: { id: true, order: true },
    });
    const order = (last?.order ?? -1) + 1;
    await delegate.create({ data: { ...cfg.toData(parsed.data), order } });
    const label = cfg.labelField ? String(parsed.data[cfg.labelField]) : undefined;
    await logActivity("created", cfg.entity, label);
    revalidate(cfg);
    return { ok: true };
  } catch (err) {
    console.error(`[${cfg.entity}] create failed:`, err);
    return { ok: false, error: `Could not create ${cfg.entity}.` };
  }
}

export async function crudUpdate<T>(
  cfg: CrudConfig<T>,
  id: string,
  raw: Record<string, unknown>
): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  const parsed = cfg.schema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: FIX_FIELDS_MESSAGE,
      fieldErrors: toFieldErrors(parsed.error),
    };
  try {
    await delegateFor(cfg.model).update({ where: { id }, data: cfg.toData(parsed.data) });
    const label = cfg.labelField ? String(parsed.data[cfg.labelField]) : undefined;
    await logActivity("updated", cfg.entity, label);
    revalidate(cfg);
    return { ok: true };
  } catch (err) {
    console.error(`[${cfg.entity}] update failed:`, err);
    return { ok: false, error: `Could not update ${cfg.entity}.` };
  }
}

/**
 * Persist a new display order: `ids` is the full list in its new sequence and
 * each row's `order` becomes its index. One transaction, so a failure halfway
 * cannot leave two items claiming the same slot.
 */
export async function crudReorder<T>(cfg: CrudConfig<T>, ids: string[]): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id)) {
    return { ok: false, error: "Invalid order." };
  }
  try {
    const delegate = delegateFor(cfg.model);
    await prisma.$transaction(
      ids.map(
        (id, i) =>
          delegate.update({ where: { id }, data: { order: i } }) as unknown as Prisma.PrismaPromise<unknown>
      )
    );
    revalidate(cfg);
    return { ok: true };
  } catch (err) {
    console.error(`[${cfg.entity}] reorder failed:`, err);
    return { ok: false, error: `Could not reorder ${cfg.entity}s.` };
  }
}

export async function crudDelete<T>(cfg: CrudConfig<T>, id: string): Promise<ActionResult> {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    await delegateFor(cfg.model).delete({ where: { id } });
    await logActivity("deleted", cfg.entity);
    revalidate(cfg);
    return { ok: true };
  } catch (err) {
    console.error(`[${cfg.entity}] delete failed:`, err);
    return { ok: false, error: `Could not delete ${cfg.entity}.` };
  }
}

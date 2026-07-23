import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type ActionResult } from "@/lib/auth-guard";
import { logActivity } from "@/lib/activity";

type Delegate = {
  create(args: { data: Record<string, unknown> }): Promise<{ id: string }>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<{ id: string }>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  count(args?: unknown): Promise<number>;
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
  await requireAdmin();
  const parsed = cfg.schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };
  try {
    const delegate = delegateFor(cfg.model);
    const order = await delegate.count();
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
  await requireAdmin();
  const parsed = cfg.schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields." };
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

export async function crudDelete<T>(cfg: CrudConfig<T>, id: string): Promise<ActionResult> {
  await requireAdmin();
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/auth-guard";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Switch } from "@/components/admin/ui/switch";
import { Card, CardContent } from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { Field } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagsInput } from "@/components/admin/TagsInput";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "image"
  | "tags"
  | "switch"
  | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  folder?: string;
  options?: { label: string; value: string }[];
  full?: boolean; // span both columns
  defaultValue?: unknown;
};

export type EntityItem = { id: string } & Record<string, unknown>;

function defaultFor(f: FieldConfig): unknown {
  if (f.defaultValue !== undefined) return f.defaultValue;
  switch (f.type) {
    case "tags":
      return [];
    case "switch":
      return false;
    case "number":
      return 0;
    case "select":
      return f.options?.[0]?.value ?? "";
    default:
      return "";
  }
}

export function EntityManager({
  items,
  fields,
  labelKey,
  subtitleKey,
  imageKey,
  iconKey,
  create,
  update,
  remove,
  addLabel = "Add item",
  emptyLabel = "Nothing here yet. Add your first item.",
}: {
  items: EntityItem[];
  fields: FieldConfig[];
  labelKey: string;
  subtitleKey?: string;
  imageKey?: string;
  iconKey?: string;
  create: (values: Record<string, unknown>) => Promise<ActionResult>;
  update: (id: string, values: Record<string, unknown>) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
  addLabel?: string;
  emptyLabel?: string;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{ open: boolean; editing?: EntityItem }>({ open: false });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ open: true })}>
          <Plus className="size-4" /> {addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 py-4">
                {imageKey && item[imageKey] ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={String(item[imageKey])} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : iconKey && item[iconKey] ? (
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <DataIcon name={String(item[iconKey]) as never} className="size-5" />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{String(item[labelKey] ?? "")}</p>
                  {subtitleKey && (
                    <p className="truncate text-sm text-muted-foreground">
                      {String(item[subtitleKey] ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setDialog({ open: true, editing: item })}>
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDialog
                    title="Delete this item?"
                    onConfirm={async () => {
                      const res = await remove(item.id);
                      if (res.ok) router.refresh();
                      return res;
                    }}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialog.open && (
      <EntityDialog
        key={dialog.editing?.id ?? "new"}
        editing={dialog.editing}
        fields={fields}
        onClose={() => setDialog({ open: false })}
        onSave={async (values) => {
          const res = dialog.editing
            ? await update(dialog.editing.id, values)
            : await create(values);
          if (res.ok) {
            toast.success("Saved.");
            setDialog({ open: false });
            router.refresh();
          } else {
            toast.error(res.error ?? "Something went wrong.");
          }
        }}
      />
      )}
    </div>
  );
}

function EntityDialog({
  editing,
  fields,
  onClose,
  onSave,
}: {
  editing?: EntityItem;
  fields: FieldConfig[];
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      initial[f.name] = editing ? editing[f.name] ?? defaultFor(f) : defaultFor(f);
    }
    return initial;
  });
  const [pending, start] = useTransition();

  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add new"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={cn(f.full || f.type === "textarea" || f.type === "image" || f.type === "tags" ? "sm:col-span-2" : "")}>
              <Field label={f.label} hint={f.hint}>
                {f.type === "text" && (
                  <Input value={String(values[f.name] ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
                )}
                {f.type === "number" && (
                  <Input type="number" value={Number(values[f.name] ?? 0)} onChange={(e) => set(f.name, Number(e.target.value))} />
                )}
                {f.type === "textarea" && (
                  <Textarea rows={3} value={String(values[f.name] ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
                )}
                {f.type === "tags" && (
                  <TagsInput value={(values[f.name] as string[]) ?? []} onChange={(v) => set(f.name, v)} />
                )}
                {f.type === "switch" && (
                  <div className="pt-1">
                    <Switch checked={Boolean(values[f.name])} onCheckedChange={(v) => set(f.name, v)} />
                  </div>
                )}
                {f.type === "image" && (
                  <ImageUpload value={String(values[f.name] ?? "")} folder={f.folder} onChange={(url) => set(f.name, url)} />
                )}
                {f.type === "select" && (
                  <Select value={String(values[f.name] ?? "")} onValueChange={(v) => set(f.name, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={() => start(() => onSave(values))} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

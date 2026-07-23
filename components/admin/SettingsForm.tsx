"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/auth-guard";
import type { FieldConfig } from "@/components/admin/EntityManager";
import { Field } from "@/components/admin/Field";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Switch } from "@/components/admin/ui/switch";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagsInput } from "@/components/admin/TagsInput";
import { cn } from "@/lib/utils";

export function SettingsForm({
  fields,
  initial,
  action,
  submitLabel = "Save changes",
}: {
  fields: FieldConfig[];
  initial: Record<string, unknown>;
  action: (values: Record<string, unknown>) => Promise<ActionResult>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [pending, start] = useTransition();
  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  function save() {
    start(async () => {
      const res = await action(values);
      if (res.ok) {
        toast.success("Saved.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={cn(
                f.full || f.type === "textarea" || f.type === "image" || f.type === "tags"
                  ? "sm:col-span-2"
                  : ""
              )}
            >
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
              </Field>
            </div>
          ))}
        </div>
        <Button onClick={save} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { aboutSchema, type AboutFormValues } from "@/lib/schemas/about";
import { updateAbout } from "@/app/(admin)/admin/(panel)/about/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Field } from "@/components/admin/Field";

export function AboutForm({ initial }: { initial: AboutFormValues }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AboutFormValues>({ resolver: zodResolver(aboutSchema), defaultValues: initial });

  const paragraphs = watch("paragraphs");
  const values = watch("values");

  function onSubmit(data: AboutFormValues) {
    start(async () => {
      const res = await updateAbout(data);
      if (res.ok) {
        toast.success("About section saved.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Heading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Eyebrow" htmlFor="eyebrow" error={errors.eyebrow?.message}>
            <Input id="eyebrow" {...register("eyebrow")} />
          </Field>
          <Field label="Title" htmlFor="title" error={errors.title?.message}>
            <Textarea id="title" rows={2} {...register("title")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Paragraphs</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setValue("paragraphs", [...paragraphs, ""])}
          >
            <Plus className="size-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {paragraphs.map((_, i) => (
            <div key={i} className="flex gap-2">
              <Textarea rows={3} {...register(`paragraphs.${i}`)} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() =>
                  setValue("paragraphs", paragraphs.filter((_, idx) => idx !== i))
                }
                aria-label="Remove paragraph"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {errors.paragraphs && (
            <p className="text-xs text-destructive">At least one non-empty paragraph is required.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Values / highlights</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setValue("values", [...values, { icon: "Sparkles", title: "", description: "" }])
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {values.map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Value {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setValue("values", values.filter((_, idx) => idx !== i))}
                  aria-label="Remove value"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Icon" hint="Lucide icon name (e.g. Gauge, Rocket).">
                  <Input {...register(`values.${i}.icon`)} />
                </Field>
                <Field label="Title">
                  <Input {...register(`values.${i}.title`)} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Description">
                  <Textarea rows={2} {...register(`values.${i}.description`)} />
                </Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { heroSchema, type HeroFormValues } from "@/lib/schemas/hero";
import { updateHero } from "@/app/(admin)/admin/(panel)/hero/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Switch } from "@/components/admin/ui/switch";
import { Label } from "@/components/admin/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Field } from "@/components/admin/Field";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagsInput } from "@/components/admin/TagsInput";

export function HeroForm({ initial }: { initial: HeroFormValues }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<HeroFormValues>({ resolver: zodResolver(heroSchema), defaultValues: initial });

  const preview = watch();

  function onSubmit(values: HeroFormValues) {
    start(async () => {
      const res = await updateHero(values);
      if (res.ok) {
        toast.success("Hero section saved.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" {...register("name")} />
              </Field>
              <Field label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" {...register("firstName")} />
              </Field>
              <Field label="Initials" htmlFor="initials" error={errors.initials?.message}>
                <Input id="initials" {...register("initials")} />
              </Field>
              <Field label="Title" htmlFor="role" error={errors.role?.message}>
                <Input id="role" {...register("role")} />
              </Field>
            </div>
            <Field label="Rotating roles" hint="Words that cycle in the headline.">
              <Controller
                control={control}
                name="roles"
                render={({ field }) => <TagsInput value={field.value} onChange={field.onChange} />}
              />
            </Field>
            <Field label="Subtitle / description" htmlFor="subheadline" error={errors.subheadline?.message}>
              <Textarea id="subheadline" rows={3} {...register("subheadline")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location" htmlFor="location" error={errors.location?.message}>
                <Input id="location" {...register("location")} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" {...register("email")} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call-to-action buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary button label" htmlFor="primaryCtaLabel" error={errors.primaryCtaLabel?.message}>
                <Input id="primaryCtaLabel" {...register("primaryCtaLabel")} />
              </Field>
              <Field label="Primary button link" htmlFor="primaryCtaHref" error={errors.primaryCtaHref?.message}>
                <Input id="primaryCtaHref" {...register("primaryCtaHref")} />
              </Field>
              <Field label="Secondary button label" htmlFor="secondaryCtaLabel" error={errors.secondaryCtaLabel?.message}>
                <Input id="secondaryCtaLabel" {...register("secondaryCtaLabel")} />
              </Field>
              <Field label="Secondary button link" htmlFor="secondaryCtaHref" error={errors.secondaryCtaHref?.message}>
                <Input id="secondaryCtaHref" {...register("secondaryCtaHref")} />
              </Field>
            </div>
            <Field label="Résumé link" htmlFor="resumeUrl" error={errors.resumeUrl?.message}>
              <Input id="resumeUrl" {...register("resumeUrl")} />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="availabilityOpen">Open to work</Label>
              <Controller
                control={control}
                name="availabilityOpen"
                render={({ field }) => (
                  <Switch id="availabilityOpen" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <Field label="Availability label" htmlFor="availabilityLabel" error={errors.availabilityLabel?.message}>
              <Input id="availabilityLabel" {...register("availabilityLabel")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hero image</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="heroImage"
              render={({ field }) => (
                <ImageUpload value={field.value} onChange={field.onChange} folder="portfolio/hero" />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {preview.availabilityOpen && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
                <span className="size-2 rounded-full bg-emerald-500" />
                {preview.availabilityLabel}
              </span>
            )}
            <p className="text-sm text-muted-foreground">Hi, I&apos;m {preview.name}</p>
            <p className="text-lg font-semibold">{preview.role}</p>
            <p className="text-sm text-muted-foreground">{preview.subheadline}</p>
            <div className="flex gap-2 pt-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                {preview.primaryCtaLabel}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs">
                {preview.secondaryCtaLabel}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

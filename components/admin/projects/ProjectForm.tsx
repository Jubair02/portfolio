"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import {
  projectSchema,
  projectDefaults,
  slugify,
  type ProjectFormValues,
} from "@/lib/schemas/project";
import { createProject, updateProject } from "@/app/(admin)/admin/(panel)/projects/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagsInput } from "@/components/admin/TagsInput";

function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ProjectForm({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: ProjectFormValues;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initial ?? projectDefaults,
  });

  const screenshots = watch("screenshots");
  const titleVal = watch("title");
  const slugVal = watch("slug");

  function onSubmit(values: ProjectFormValues) {
    start(async () => {
      const res =
        mode === "create"
          ? await createProject(values)
          : await updateProject(id!, values);

      if (res.ok) {
        toast.success(mode === "create" ? "Project created." : "Project saved.");
        router.push("/admin/projects");
        router.refresh();
        return;
      }
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          setError(k as keyof ProjectFormValues, { message: v });
        }
      }
      toast.error(res.error ?? "Please fix the errors and try again.");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Title" htmlFor="title" error={errors.title?.message}>
                <Input
                  id="title"
                  {...register("title")}
                  onBlur={() => {
                    if (mode === "create" && !slugVal && titleVal) {
                      setValue("slug", slugify(titleVal), { shouldValidate: true });
                    }
                  }}
                />
              </Field>

              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Used in the URL. Lowercase letters, numbers and dashes."
              >
                <div className="flex gap-2">
                  <Input id="slug" {...register("slug")} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("slug", slugify(titleVal), { shouldValidate: true })}
                  >
                    Generate
                  </Button>
                </div>
              </Field>

              <Field
                label="Short description"
                htmlFor="tagline"
                error={errors.tagline?.message}
              >
                <Input id="tagline" {...register("tagline")} />
              </Field>

              <Field
                label="Full description"
                htmlFor="description"
                error={errors.description?.message}
              >
                <Textarea id="description" rows={4} {...register("description")} />
              </Field>

              <Field label="Case study (optional)" htmlFor="caseStudy">
                <Textarea id="caseStudy" rows={4} {...register("caseStudy")} />
              </Field>

              <Field label="Technologies" error={errors.tech?.message}>
                <Controller
                  control={control}
                  name="tech"
                  render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Cover image">
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="portfolio/projects"
                    />
                  )}
                />
              </Field>

              <Field label="Screenshots">
                <div className="space-y-3">
                  {screenshots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {screenshots.map((url) => (
                        <div key={url} className="group relative overflow-hidden rounded-lg border border-border">
                          <Image
                            src={url}
                            alt="Screenshot"
                            width={200}
                            height={120}
                            className="h-20 w-full object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            aria-label="Remove screenshot"
                            onClick={() =>
                              setValue(
                                "screenshots",
                                screenshots.filter((s) => s !== url)
                              )
                            }
                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ImageUpload
                    folder="portfolio/projects"
                    onChange={(url) => url && setValue("screenshots", [...screenshots, url])}
                  />
                </div>
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              <Field label="Display order" htmlFor="order" error={errors.order?.message}>
                <Input
                  id="order"
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Category" htmlFor="category">
                <Input id="category" {...register("category")} />
              </Field>
              <Field label="Year" htmlFor="year">
                <Input id="year" {...register("year")} />
              </Field>
              <Field label="GitHub URL" htmlFor="githubUrl">
                <Input id="githubUrl" placeholder="https://github.com/…" {...register("githubUrl")} />
              </Field>
              <Field label="Live URL" htmlFor="liveUrl">
                <Input id="liveUrl" placeholder="https://…" {...register("liveUrl")} />
              </Field>
              <Field
                label="Icon"
                htmlFor="icon"
                hint="Lucide icon name (e.g. Rocket, Server, Sparkles). Used when no cover image."
              >
                <Input id="icon" {...register("icon")} />
              </Field>
              <Field
                label="Gradient"
                htmlFor="gradient"
                hint="Tailwind gradient stops for the fallback cover."
              >
                <Input id="gradient" {...register("gradient")} />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/projects")}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

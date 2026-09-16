"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import { Loader2, X, Plus, Trash2 } from "lucide-react";
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
import { IconPicker } from "@/components/admin/IconPicker";
import { DeckUpload } from "@/components/admin/DeckUpload";
import { FileUploadButton } from "@/components/admin/FileUploadButton";

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
  const attachments = watch("attachments");
  const demoAccounts = watch("demoAccounts");
  const titleVal = watch("title");
  const slugVal = watch("slug");
  const metrics = watch("metrics");
  const iconVal = watch("icon");

  function onSubmit(values: ProjectFormValues) {
    start(async () => {
      const res = await runAction(() =>
        mode === "create" ? createProject(values) : updateProject(id!, values)
      );

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
      toastActionError(res, "Please fix the errors and try again.");
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
                hint="Unique identifier — lowercase letters, numbers and dashes. Reserved for future per-project pages."
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

              <Field
                label="Metrics (optional)"
                hint="Small stat boxes shown under the case study — e.g. Label “Layout” / Value “Fully responsive”."
              >
                <div className="space-y-2">
                  {metrics.map((_, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input placeholder="Label" {...register(`metrics.${i}.label`)} />
                        {errors.metrics?.[i]?.label && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.metrics[i]?.label?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input placeholder="Value" {...register(`metrics.${i}.value`)} />
                        {errors.metrics?.[i]?.value && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.metrics[i]?.value?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        aria-label="Remove metric"
                        onClick={() => setValue("metrics", metrics.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("metrics", [...metrics, { label: "", value: "" }])}
                  >
                    <Plus className="size-4" /> Add metric
                  </Button>
                </div>
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
              <CardTitle className="text-base">Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Key features"
                hint="One per line. Shown as a ticked list above the case study."
              >
                <Controller
                  control={control}
                  name="features"
                  render={({ field }) => (
                    <TagsInput value={field.value} onChange={field.onChange} variant="line" />
                  )}
                />
              </Field>
              <Field
                label="The hard part"
                htmlFor="challenges"
                hint="What was difficult, and how you got past it."
              >
                <Textarea id="challenges" rows={4} {...register("challenges")} />
              </Field>
              <Field
                label="What I took from it"
                htmlFor="learnings"
                hint="What you learned, or would do differently next time."
              >
                <Textarea id="learnings" rows={4} {...register("learnings")} />
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

              <Field
                label="Screenshots"
                hint="Shown as a thumbnail strip inside the expanded case study on the site."
              >
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

              <Field
                label="Architecture diagram"
                hint="Optional. Shown full width under “How it fits together”."
              >
                <Controller
                  control={control}
                  name="architectureImage"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="portfolio/architecture"
                    />
                  )}
                />
              </Field>
              <Field
                label="Architecture notes"
                htmlFor="architectureNote"
                hint="A short paragraph explaining how the pieces connect."
              >
                <Textarea id="architectureNote" rows={3} {...register("architectureNote")} />
              </Field>

              <Field
                label="Walkthrough video"
                htmlFor="videoUrl"
                hint="A YouTube or Vimeo link. Embedded above the slides."
                error={errors.videoUrl?.message}
              >
                <Input id="videoUrl" placeholder="https://youtu.be/…" {...register("videoUrl")} />
              </Field>
            </CardContent>
          </Card>

          {/* ---------------------------------------------------- Slides & files */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slides &amp; documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Field
                label="Slide deck"
                hint="A PDF is shown slide by slide on the project page. Export from PowerPoint or Google Slides as PDF."
              >
                <Controller
                  control={control}
                  name="deck"
                  render={({ field }) => (
                    <DeckUpload value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>

              <Field
                label="Downloads"
                hint="Reports, specs or anything else a visitor can download."
              >
                <div className="space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input placeholder="Label, e.g. Project report" {...register(`attachments.${i}.label`)} />
                        {errors.attachments?.[i]?.label && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.attachments[i]?.label?.message}
                          </p>
                        )}
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {file.url ? file.url.split("/").pop() : "No file uploaded yet"}
                        </p>
                      </div>
                      <FileUploadButton
                        label={file.url ? "Replace" : "Upload"}
                        onUploaded={({ url, publicId, name }) =>
                          setValue(
                            "attachments",
                            attachments.map((a, idx) =>
                              idx === i ? { ...a, url, publicId, label: a.label || name } : a
                            ),
                            { shouldValidate: true }
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        aria-label="Remove download"
                        onClick={() =>
                          setValue("attachments", attachments.filter((_, idx) => idx !== i))
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValue("attachments", [...attachments, { label: "", url: "" }])
                    }
                  >
                    <Plus className="size-4" /> Add a download
                  </Button>
                </div>
              </Field>
            </CardContent>
          </Card>

          {/* ---------------------------------------------------- Demo access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demo access</CardTitle>
            </CardHeader>
            <CardContent>
              <Field
                label="Demo logins"
                hint="Shown as a “Try the demo” box with copy buttons. Only use throwaway accounts on seeded data."
              >
                <div className="space-y-3">
                  {demoAccounts.map((_, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <div className="flex items-start gap-2">
                        <div className="grid flex-1 gap-2 sm:grid-cols-3">
                          <div>
                            <Input placeholder="Role, e.g. Admin" {...register(`demoAccounts.${i}.role`)} />
                            {errors.demoAccounts?.[i]?.role && (
                              <p className="mt-1 text-xs text-destructive">
                                {errors.demoAccounts[i]?.role?.message}
                              </p>
                            )}
                          </div>
                          <Input placeholder="Username or email" {...register(`demoAccounts.${i}.username`)} />
                          <Input placeholder="Password" {...register(`demoAccounts.${i}.password`)} />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive"
                          aria-label="Remove login"
                          onClick={() =>
                            setValue("demoAccounts", demoAccounts.filter((_, idx) => idx !== i))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Input
                        className="mt-2"
                        placeholder="Note (optional), e.g. Can approve appointments"
                        {...register(`demoAccounts.${i}.note`)}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValue("demoAccounts", [
                        ...demoAccounts,
                        { role: "", username: "", password: "", note: "" },
                      ])
                    }
                  >
                    <Plus className="size-4" /> Add a login
                  </Button>
                </div>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Quote"
                htmlFor="feedbackQuote"
                hint="Something the client, team or supervisor said about this project."
              >
                <Textarea id="feedbackQuote" rows={3} {...register("feedbackQuote")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Who said it" htmlFor="feedbackAuthor">
                  <Input id="feedbackAuthor" placeholder="Name" {...register("feedbackAuthor")} />
                </Field>
                <Field label="Their role" htmlFor="feedbackRole">
                  <Input
                    id="feedbackRole"
                    placeholder="Product Owner, Acme"
                    {...register("feedbackRole")}
                  />
                </Field>
              </div>
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
              <Field label="Status" hint="Only published projects are visible on the site.">
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
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Shown on the home page. Every published project is listed on /projects.</p>
                </div>
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
              <Field label="Year" htmlFor="year">
                <Input id="year" {...register("year")} />
              </Field>
              <Field label="GitHub URL" htmlFor="githubUrl">
                <Input id="githubUrl" placeholder="https://github.com/…" {...register("githubUrl")} />
              </Field>
              <Field label="Live URL" htmlFor="liveUrl">
                <Input id="liveUrl" placeholder="https://…" {...register("liveUrl")} />
              </Field>
              <Field label="Icon" hint="Used when there is no cover image.">
                <IconPicker
                  value={iconVal ?? ""}
                  onChange={(v) => setValue("icon", v, { shouldDirty: true })}
                />
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search &amp; sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Page title"
                htmlFor="metaTitle"
                hint="Falls back to the project title."
                error={errors.metaTitle?.message}
              >
                <Input id="metaTitle" {...register("metaTitle")} />
              </Field>
              <Field
                label="Meta description"
                htmlFor="metaDescription"
                hint="Falls back to the full description. Around 155 characters reads best."
                error={errors.metaDescription?.message}
              >
                <Textarea id="metaDescription" rows={3} {...register("metaDescription")} />
              </Field>
              <Field label="Share image" hint="Falls back to the cover image.">
                <Controller
                  control={control}
                  name="ogImage"
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="portfolio/og"
                    />
                  )}
                />
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

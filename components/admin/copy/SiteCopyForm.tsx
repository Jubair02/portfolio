"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  siteCopySchema,
  SECTION_KEYS,
  SECTION_LABELS,
  NAV_PICKER_TARGETS,
  NAV_TARGET_LABELS,
  type SiteCopyFormValues,
} from "@/lib/schemas/site-copy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { updateSiteCopy } from "@/app/(admin)/admin/(panel)/copy/actions";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Field } from "@/components/admin/Field";
import { IconPicker } from "@/components/admin/IconPicker";
import { TagsInput } from "@/components/admin/TagsInput";

/** Small icon-only remove button used by every repeatable row. */
function RemoveRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="mt-6 shrink-0 text-destructive"
      aria-label={label}
      onClick={onClick}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function SiteCopyForm({ initial }: { initial: SiteCopyFormValues }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SiteCopyFormValues>({
    resolver: zodResolver(siteCopySchema),
    defaultValues: initial,
  });

  const heroStats = useFieldArray({ control, name: "heroStats" });
  const achievements = useFieldArray({ control, name: "achievements" });
  const miniProjects = useFieldArray({ control, name: "miniProjects" });
  const navItems = useFieldArray({ control, name: "navItems" });

  function onSubmit(values: SiteCopyFormValues) {
    start(async () => {
      const res = await runAction(() => updateSiteCopy(values));
      if (res.ok) {
        toast.success("Site copy saved.");
        router.refresh();
        return;
      }
      for (const [path, message] of Object.entries(res.fieldErrors ?? {})) {
        setError(path as FieldPath<SiteCopyFormValues>, { message });
      }
      toastActionError(res);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hero stats -------------------------------------------------------- */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Hero stats strip</CardTitle>
            <CardDescription>
              The numbers under the hero. The first one also appears on the floating card
              beside your portrait.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={heroStats.fields.length >= 6}
            onClick={() => heroStats.append({ label: "", value: 0, suffix: "+" })}
          >
            <Plus className="size-4" /> Add stat
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {heroStats.fields.map((row, i) => (
            <div key={row.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_6rem_5rem]">
                <Field label="Label" error={errors.heroStats?.[i]?.label?.message}>
                  <Input {...register(`heroStats.${i}.label`)} placeholder="Projects shipped" />
                </Field>
                <Field label="Value" error={errors.heroStats?.[i]?.value?.message}>
                  <Input
                    type="number"
                    min={0}
                    {...register(`heroStats.${i}.value`, { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Suffix" error={errors.heroStats?.[i]?.suffix?.message}>
                  <Input {...register(`heroStats.${i}.suffix`)} placeholder="+" />
                </Field>
              </div>
              <RemoveRow label="Remove stat" onClick={() => heroStats.remove(i)} />
            </div>
          ))}
          {errors.heroStats?.root?.message || errors.heroStats?.message ? (
            <p className="text-xs text-destructive">
              {errors.heroStats.root?.message ?? errors.heroStats.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Navigation -------------------------------------------------------- */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Navigation</CardTitle>
            <CardDescription>
              Links in the header, the mobile menu, the footer and the 404 page, in this
              order. Each one scrolls to a section of the home page, or opens a page.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={navItems.fields.length >= 8}
            onClick={() => navItems.append({ label: "", href: "#about" })}
          >
            <Plus className="size-4" /> Add link
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {navItems.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No links — the header shows only the logo and buttons.
            </p>
          )}
          {navItems.fields.map((row, i) => (
            <div key={row.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field label="Label" error={errors.navItems?.[i]?.label?.message}>
                  <Input {...register(`navItems.${i}.label`)} placeholder="About" />
                </Field>
                <Field label="Scrolls to" error={errors.navItems?.[i]?.href?.message}>
                  <Controller
                    control={control}
                    name={`navItems.${i}.href`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {NAV_PICKER_TARGETS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {NAV_TARGET_LABELS[a]}{" "}
                              <span className="text-muted-foreground">{a}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <RemoveRow label="Remove link" onClick={() => navItems.remove(i)} />
            </div>
          ))}
          {errors.navItems?.root?.message || errors.navItems?.message ? (
            <p className="text-xs text-destructive">
              {errors.navItems.root?.message ?? errors.navItems.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Section headings -------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section headings</CardTitle>
          <CardDescription>
            The small eyebrow label, the big title and the one-line description at the top
            of each section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {SECTION_KEYS.map((key) => (
            <fieldset key={key} className="space-y-3 rounded-xl border border-border p-4">
              <legend className="px-1 text-sm font-semibold">{SECTION_LABELS[key]}</legend>
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <Field label="Eyebrow" error={errors.sections?.[key]?.eyebrow?.message}>
                  <Input {...register(`sections.${key}.eyebrow`)} />
                </Field>
                <Field label="Title" error={errors.sections?.[key]?.title?.message}>
                  <Input {...register(`sections.${key}.title`)} />
                </Field>
              </div>
              <Field
                label="Description"
                hint={key === "testimonials" ? "Optional — this section has no description by default." : undefined}
                error={errors.sections?.[key]?.description?.message}
              >
                <Textarea rows={2} {...register(`sections.${key}.description`)} />
              </Field>
            </fieldset>
          ))}
        </CardContent>
      </Card>

      {/* About note + marquee ---------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About — learning note</CardTitle>
            <CardDescription>
              The 🚀 card under your values. Wrap words in **double asterisks** to make them
              bold. Leave empty to hide the card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Note" error={errors.aboutNote?.message}>
              <Textarea rows={4} {...register("aboutNote")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills marquee</CardTitle>
            <CardDescription>
              The scrolling row of technology names under the skill cards. Leave empty to
              hide it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Technologies" error={errors.techMarquee?.message}>
              <Controller
                control={control}
                name="techMarquee"
                render={({ field }) => <TagsInput value={field.value} onChange={field.onChange} />}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      {/* Achievements ------------------------------------------------------ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">“By the numbers” panel</CardTitle>
            <CardDescription>
              Shown beside your certificates. Leave empty to hide the panel.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={achievements.fields.length >= 8}
            onClick={() => achievements.append({ icon: "Trophy", label: "", metric: "" })}
          >
            <Plus className="size-4" /> Add row
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No entries — the panel is hidden.</p>
          )}
          {achievements.fields.map((row, i) => (
            <div key={row.id} className="flex items-start gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-[11rem_1fr_6rem]">
                <Field label="Icon" error={errors.achievements?.[i]?.icon?.message}>
                  <Controller
                    control={control}
                    name={`achievements.${i}.icon`}
                    render={({ field }) => (
                      <IconPicker value={field.value} onChange={field.onChange} />
                    )}
                  />
                </Field>
                <Field label="Label" error={errors.achievements?.[i]?.label?.message}>
                  <Input {...register(`achievements.${i}.label`)} placeholder="Live projects deployed" />
                </Field>
                <Field label="Metric" error={errors.achievements?.[i]?.metric?.message}>
                  <Input {...register(`achievements.${i}.metric`)} placeholder="10+" />
                </Field>
              </div>
              <RemoveRow label="Remove row" onClick={() => achievements.remove(i)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact ----------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact section</CardTitle>
          <CardDescription>
            The text beside the contact form. Your email and location come from the Hero page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <Field label="Eyebrow" error={errors.contact?.eyebrow?.message}>
              <Input {...register("contact.eyebrow")} />
            </Field>
            <Field label="Title" error={errors.contact?.title?.message}>
              <Input {...register("contact.title")} />
            </Field>
          </div>
          <Field label="Description" error={errors.contact?.description?.message}>
            <Textarea rows={3} {...register("contact.description")} />
          </Field>
          <Field
            label="Response time"
            hint="Shown in the small card, e.g. “Replies within 24 hours”."
            error={errors.contact?.responseTime?.message}
          >
            <Input {...register("contact.responseTime")} />
          </Field>
        </CardContent>
      </Card>

      {/* GitHub ------------------------------------------------------------ */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">GitHub</CardTitle>
            <CardDescription>
              Repository count, stars, followers, languages and the contribution graph are
              fetched live from this account every hour. The links below are the “More
              experiments” row.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={miniProjects.fields.length >= 8}
            onClick={() => miniProjects.append({ title: "", tech: "", href: "" })}
          >
            <Plus className="size-4" /> Add link
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="GitHub username"
            hint="Just the handle, e.g. Jubair02."
            error={errors.githubUsername?.message}
          >
            <Input {...register("githubUsername")} className="max-w-xs" />
          </Field>
          <div className="space-y-3">
            {miniProjects.fields.map((row, i) => (
              <div key={row.id} className="flex items-start gap-2">
                <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_8rem_1.4fr]">
                  <Field label="Title" error={errors.miniProjects?.[i]?.title?.message}>
                    <Input {...register(`miniProjects.${i}.title`)} />
                  </Field>
                  <Field label="Tech" error={errors.miniProjects?.[i]?.tech?.message}>
                    <Input {...register(`miniProjects.${i}.tech`)} placeholder="JavaScript" />
                  </Field>
                  <Field label="Link" error={errors.miniProjects?.[i]?.href?.message}>
                    <Input {...register(`miniProjects.${i}.href`)} placeholder="https://…" />
                  </Field>
                </div>
                <RemoveRow label="Remove link" onClick={() => miniProjects.remove(i)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}

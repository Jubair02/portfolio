"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  upsertCategory,
  deleteCategory,
  upsertSkill,
  deleteSkill,
  reorderSkills,
} from "@/app/(admin)/admin/(panel)/skills/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Card, CardContent } from "@/components/admin/ui/card";
import { DataIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { Field } from "@/components/admin/Field";

type Skill = { id: string; name: string; level: number };
type Category = { id: string; icon: string; title: string; blurb: string | null; skills: Skill[] };

export function SkillsManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [cats, setCats] = useState(categories);
  const [catDialog, setCatDialog] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [skillDialog, setSkillDialog] = useState<{ open: boolean; categoryId?: string; editing?: Skill }>({ open: false });

  // Re-sync local state when the server sends fresh data after a mutation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setCats(categories), [categories]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCatDialog({ open: true })}>
          <Plus className="size-4" /> Add category
        </Button>
      </div>

      {cats.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No skill categories yet. Add your first one.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {cats.map((cat) => (
          <Card key={cat.id}>
            <div className="flex items-start justify-between gap-2 p-5 pb-2">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <DataIcon name={cat.icon as never} className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{cat.title}</h3>
                  {cat.blurb && <p className="text-xs text-muted-foreground">{cat.blurb}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Edit category" onClick={() => setCatDialog({ open: true, editing: cat })}>
                  <Pencil className="size-4" />
                </Button>
                <ConfirmDialog
                  title={`Delete "${cat.title}"?`}
                  description="This removes the category and all its skills."
                  onConfirm={async () => {
                    const res = await deleteCategory(cat.id);
                    if (res.ok) router.refresh();
                    return res;
                  }}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Delete category" className="text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  }
                />
              </div>
            </div>

            <CardContent>
              <SkillList
                skills={cat.skills}
                onReorder={(ids) => {
                  setCats((prev) =>
                    prev.map((c) =>
                      c.id === cat.id
                        ? { ...c, skills: ids.map((id) => c.skills.find((s) => s.id === id)!) }
                        : c
                    )
                  );
                  reorderSkills(ids);
                }}
                onEdit={(s) => setSkillDialog({ open: true, categoryId: cat.id, editing: s })}
                onDelete={async (id) => {
                  const res = await deleteSkill(id);
                  if (res.ok) router.refresh();
                  else toast.error(res.error ?? "Failed.");
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setSkillDialog({ open: true, categoryId: cat.id })}
              >
                <Plus className="size-4" /> Add skill
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {catDialog.open && (
        <CategoryDialog
          editing={catDialog.editing}
          onClose={() => setCatDialog({ open: false })}
          onSaved={() => {
            setCatDialog({ open: false });
            router.refresh();
          }}
        />
      )}
      {skillDialog.open && skillDialog.categoryId && (
        <SkillDialog
          categoryId={skillDialog.categoryId}
          editing={skillDialog.editing}
          onClose={() => setSkillDialog({ open: false })}
          onSaved={() => {
            setSkillDialog({ open: false });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function SkillList({
  skills,
  onReorder,
  onEdit,
  onDelete,
}: {
  skills: Skill[];
  onReorder: (ids: string[]) => void;
  onEdit: (s: Skill) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = skills.map((s) => s.id);
    const next = arrayMove(ids, ids.indexOf(active.id as string), ids.indexOf(over.id as string));
    onReorder(next);
  }

  if (skills.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">No skills yet.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1.5">
          {skills.map((s) => (
            <SortableSkill key={s.id} skill={s} onEdit={() => onEdit(s)} onDelete={() => onDelete(s.id)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableSkill({ skill, onEdit, onDelete }: { skill: Skill; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5"
    >
      <button type="button" className="cursor-grab touch-none text-muted-foreground" {...attributes} {...listeners} aria-label="Drag to reorder">
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 text-sm font-medium">{skill.name}</span>
      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
        <div className="h-full rounded-full bg-primary" style={{ width: `${skill.level}%` }} />
      </div>
      <span className="w-9 text-right font-mono text-xs text-muted-foreground">{skill.level}%</span>
      <Button variant="ghost" size="icon" className="size-7" aria-label="Edit skill" onClick={onEdit}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label="Delete skill" onClick={onDelete}>
        <Trash2 className="size-3.5" />
      </Button>
    </li>
  );
}

function CategoryDialog({
  editing,
  onClose,
  onSaved,
}: {
  editing?: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [icon, setIcon] = useState(editing?.icon ?? "Layers");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [blurb, setBlurb] = useState(editing?.blurb ?? "");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await upsertCategory(editing?.id ?? null, { icon, title, blurb });
      if (res.ok) {
        toast.success("Saved.");
        onSaved();
      } else toast.error(res.error ?? "Failed.");
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Icon" hint="Lucide icon name (e.g. Layers, Server, Database).">
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
          </Field>
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Blurb">
            <Input value={blurb} onChange={(e) => setBlurb(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={save} disabled={pending || !title}>
            {pending && <Loader2 className="size-4 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SkillDialog({
  categoryId,
  editing,
  onClose,
  onSaved,
}: {
  categoryId: string;
  editing?: Skill;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [level, setLevel] = useState(editing?.level ?? 80);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await upsertSkill(categoryId, editing?.id ?? null, { name, level });
      if (res.ok) {
        toast.success("Saved.");
        onSaved();
      } else toast.error(res.error ?? "Failed.");
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit skill" : "Add skill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={`Proficiency — ${level}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button onClick={save} disabled={pending || !name}>
            {pending && <Loader2 className="size-4 animate-spin" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

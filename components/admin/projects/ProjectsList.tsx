"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  EllipsisVertical,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteProject,
  toggleFeatured,
  toggleStatus,
} from "@/app/(admin)/admin/(panel)/projects/actions";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Input } from "@/components/admin/ui/input";
import { DataIcon } from "@/components/icons";
import { isIconName } from "@/lib/icon-names";
import { cn } from "@/lib/utils";

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  order: number;
  image: string | null;
  icon: string;
  tech: string[];
  year: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  /** ISO timestamp — used for sorting only, never rendered. */
  updatedAt: string;
  /** Formatted on the server so the label can't disagree with the client clock. */
  updatedLabel: string;
};

type Filter = "all" | "published" | "draft" | "featured";
type Sort = "order" | "recent" | "title";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "featured", label: "Featured" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "order", label: "Display order" },
  { key: "recent", label: "Recently updated" },
  { key: "title", label: "Title (A–Z)" },
];

/* One grid definition, shared by the column header and every row, so the two
 * can't drift apart. Stack and Order only earn their own column at lg; below
 * that they fold back into the project cell or drop out entirely. */
const GRID =
  "md:grid md:grid-cols-[minmax(0,1fr)_9.5rem_2.5rem] md:items-center md:gap-4 " +
  "lg:grid-cols-[minmax(0,1fr)_13rem_9.5rem_4rem_2.5rem]";

export function ProjectsList({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("order");
  const reduceMotion = useReducedMotion();

  const counts = useMemo(
    () => ({
      all: projects.length,
      published: projects.filter((p) => p.status === "PUBLISHED").length,
      draft: projects.filter((p) => p.status === "DRAFT").length,
      featured: projects.filter((p) => p.featured).length,
    }),
    [projects]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = projects.filter((p) => {
      if (filter === "published" && p.status !== "PUBLISHED") return false;
      if (filter === "draft" && p.status !== "DRAFT") return false;
      if (filter === "featured" && !p.featured) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.tech.some((t) => t.toLowerCase().includes(q))
      );
    });

    return [...rows].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "recent") return b.updatedAt.localeCompare(a.updatedAt);
      return a.order - b.order || a.title.localeCompare(b.title);
    });
  }, [projects, query, filter, sort]);

  const filtering = query.trim() !== "" || filter !== "all";
  const activeSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  return (
    <div className="space-y-5">
      {/* Toolbar — pulled full-bleed so it sits flush under the topbar once stuck */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, slug or stack…"
              aria-label="Search projects"
              className="h-10 pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            {/* Segmented filter — scrolls rather than wrapping on narrow screens */}
            <div
              role="tablist"
              aria-label="Filter projects"
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/60 p-1 [scrollbar-width:none] lg:flex-none [&::-webkit-scrollbar]:hidden"
            >
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="projects-filter-pill"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                        className="absolute inset-0 rounded-lg border border-border bg-card shadow-sm"
                      />
                    )}
                    <span className="relative flex items-center gap-1.5 whitespace-nowrap">
                      {f.label}
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {counts[f.key]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="shrink-0 px-3">
                  <ArrowUpDown className="size-4" />
                  <span className="hidden sm:inline">{activeSort.label}</span>
                  <span className="sr-only sm:hidden">Sort projects</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {SORTS.map((s) => (
                  <DropdownMenuItem key={s.key} onSelect={() => setSort(s.key)}>
                    <Check className={cn("size-4", sort === s.key ? "opacity-100" : "opacity-0")} />
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="size-6" />}
          title="No projects yet"
          body="Projects are the centrepiece of your portfolio. Add your first one and it shows up on the landing page and in the full catalogue."
          action={
            <Button asChild>
              <Link href="/admin/projects/new">
                <Plus className="size-4" />
                Create your first project
              </Link>
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="Nothing matches those filters"
          body={
            query.trim()
              ? `No project matches “${query.trim()}”. Try a different term, or widen the filter.`
              : "No project carries that status yet."
          }
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              <X className="size-4" />
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtering && (
            <p className="px-1 text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{visible.length}</span> of{" "}
              {projects.length} projects
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Column header appears only once every column has room */}
            <div
              className={cn(
                "hidden bg-muted/40 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground lg:grid",
                GRID
              )}
            >
              <span>Project</span>
              <span>Stack</span>
              <span>Status</span>
              <span className="text-right">Order</span>
              <span className="sr-only">Actions</span>
            </div>

            <ul className="divide-y divide-border">
              {visible.map((p) => (
                <ProjectRowItem key={p.id} project={p} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ProjectRowItem({ project: p }: { project: ProjectRow }) {
  return (
    <li
      className={cn(
        "group relative p-4 transition-colors hover:bg-muted/40",
        "has-[:focus-visible]:bg-muted/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring",
        GRID
      )}
    >
      {/* The whole row opens the editor; the action cluster sits above it. */}
      <Link
        href={`/admin/projects/${p.id}`}
        className="absolute inset-0 z-0 outline-none"
        aria-label={`Edit ${p.title}`}
      />

      {/* Project */}
      <div className="flex min-w-0 items-center gap-3">
        <Thumb project={p} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
            <span className="truncate">{p.title}</span>
            {p.featured && (
              <span className="inline-flex shrink-0 items-center">
                <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                <span className="sr-only">Featured</span>
              </span>
            )}
            {p.year && (
              <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                {p.year}
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.tagline}</p>
          {/* Stack rides with the title until it earns its own column */}
          <TechList tech={p.tech} className="mt-2 lg:hidden" />
        </div>
      </div>

      {/* Stack */}
      <TechList tech={p.tech} className="hidden lg:flex" />

      {/* Status · Order · Actions — a footer row on mobile, real columns from md up */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 md:contents">
        <div className="min-w-0">
          <StatusPill status={p.status} />
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            Updated {p.updatedLabel}
          </p>
        </div>

        <span className="hidden text-right text-sm tabular-nums text-muted-foreground lg:block">
          {p.order}
        </span>

        <RowActions project={p} />
      </div>
    </li>
  );
}

function Thumb({ project: p }: { project: ProjectRow }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(140deg,color-mix(in_oklab,var(--primary)_16%,transparent),color-mix(in_oklab,var(--accent-2)_10%,transparent))] ring-1 ring-border">
      {p.image ? (
        <Image src={p.image} alt="" fill className="object-cover" unoptimized sizes="44px" />
      ) : (
        <DataIcon
          name={isIconName(p.icon) ? p.icon : "Sparkles"}
          className="size-5 text-primary"
        />
      )}
    </span>
  );
}

function TechList({ tech, className }: { tech: string[]; className?: string }) {
  if (tech.length === 0) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>No stack listed</span>
    );
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {tech.slice(0, 3).map((t) => (
        <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
          {t}
        </Badge>
      ))}
      {tech.length > 3 && (
        <span className="text-[10px] tabular-nums text-muted-foreground">+{tech.length - 3}</span>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ProjectRow["status"] }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        published
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          published ? "bg-emerald-500" : "bg-muted-foreground/60"
        )}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function RowActions({ project: p }: { project: ProjectRow }) {
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function run(call: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    start(async () => {
      const res = await runAction(call);
      if (res.ok) toast.success(success);
      else toastActionError(res);
    });
  }

  const published = p.status === "PUBLISHED";

  return (
    <div className="relative z-10 flex shrink-0 items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${p.title}`}
            disabled={pending}
            className="text-muted-foreground hover:text-foreground"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <EllipsisVertical className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${p.id}`}>
              <Pencil className="size-4" />
              Edit project
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() =>
              run(
                () => toggleStatus(p.id, published ? "DRAFT" : "PUBLISHED"),
                published ? "Moved to drafts." : "Published."
              )
            }
          >
            {published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {published ? "Move to drafts" : "Publish"}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() =>
              run(
                () => toggleFeatured(p.id, !p.featured),
                p.featured ? "Removed from featured." : "Added to featured."
              )
            }
          >
            {p.featured ? <StarOff className="size-4" /> : <Star className="size-4" />}
            {p.featured ? "Unfeature" : "Feature on landing page"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Open</DropdownMenuLabel>

          {/* The site has no per-project route yet — the catalogue is the page
              this project actually appears on. */}
          <DropdownMenuItem asChild>
            <a href="/projects" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              View catalogue
            </a>
          </DropdownMenuItem>

          {p.liveUrl && (
            <DropdownMenuItem asChild>
              <a href={p.liveUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Live demo
              </a>
            </DropdownMenuItem>
          )}

          {p.githubUrl && (
            <DropdownMenuItem asChild>
              <a href={p.githubUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Repository
              </a>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Outside the menu: a dialog mounted inside it fights the menu for focus */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${p.title}”?`}
        description="This permanently removes the project from your portfolio. It cannot be undone."
        onConfirm={() => deleteProject(p.id)}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-5 flex justify-center">{action}</div>
    </div>
  );
}

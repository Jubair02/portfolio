"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Search, Star } from "lucide-react";
import { deleteProject } from "@/app/(admin)/admin/(panel)/projects/actions";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export type ProjectRow = {
  id: string;
  title: string;
  tagline: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  order: number;
  image: string | null;
  tech: string[];
};

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tech.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="hidden md:table-cell">Tech</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  {query ? "No projects match your search." : "No projects yet. Create your first one."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {p.title}
                          {p.featured && <Star className="size-3.5 fill-gold text-gold" />}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tech.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                      {p.tech.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{p.tech.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {p.order}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/projects/${p.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        title={`Delete "${p.title}"?`}
                        description="This permanently removes the project from your portfolio."
                        onConfirm={() => deleteProject(p.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

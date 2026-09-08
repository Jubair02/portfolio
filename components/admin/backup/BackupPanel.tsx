"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Loader2, AlertTriangle, FileJson } from "lucide-react";
import { toast } from "sonner";
import { importContentAction } from "@/app/(admin)/admin/(panel)/backup/actions";
import { toastActionError } from "@/components/admin/action-feedback";
import { Button } from "@/components/admin/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";

export function BackupPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, start] = useTransition();

  function restore() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    start(async () => {
      try {
        const res = await importContentAction(fd);
        if (!res.ok) {
          toastActionError(res);
          return;
        }
        const s = res.summary ?? {};
        toast.success("Content restored.", {
          description: `${s.projects ?? 0} projects, ${s.skills ?? 0} skills, ${s.experience ?? 0} experience entries and more.`,
        });
        setFile(null);
        router.refresh();
      } catch (err) {
        console.error("[import] request failed:", err);
        toast.error("Could not reach the server. Nothing was changed.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4" /> Export
          </CardTitle>
          <CardDescription>
            One JSON file with the hero, about, skills, projects, experience, education,
            certificates, services, testimonials, social links, SEO, site settings and site
            copy. Messages, media records and your account are not included.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* A plain link so the browser handles the download natively. */}
          <Button asChild>
            <a href="/api/admin/export" download>
              <Download className="size-4" /> Download backup
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-amber-500/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4" /> Restore
          </CardTitle>
          <CardDescription>
            Replaces <strong>all</strong> current content with the file. Everything runs in one
            transaction, so an invalid file changes nothing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
              <FileJson className="size-4" /> Choose backup file
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground">
                {file.name} · {Math.max(1, Math.round(file.size / 1024))} KB
              </span>
            )}
          </div>

          <Dialog open={!!file && !pending} onOpenChange={(o) => !o && setFile(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-500" /> Replace all content?
                </DialogTitle>
                <DialogDescription>
                  Every project, skill, experience entry and setting will be replaced with
                  the contents of <span className="font-medium text-foreground">{file?.name}</span>.
                  Download a backup of the current content first if you have not already.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFile(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={restore}>
                  Restore
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {pending && (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Restoring…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";

/**
 * Boundary for every page inside the admin panel.
 *
 * Keeps the shell (sidebar, topbar) mounted and replaces only the page body,
 * so a failed load is recoverable in place instead of dumping the editor on a
 * blank screen. `reset()` re-renders the segment, which is enough for the
 * common causes: a dropped database connection or a transient query failure.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] page error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">This page didn&apos;t load</h2>
          <p className="text-sm text-muted-foreground">
            Something failed while loading this screen. Try again — if it keeps
            happening, your session may have ended, so sign in again.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/login">Sign in</Link>
          </Button>
        </div>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

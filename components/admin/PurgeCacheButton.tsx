"use client";

import { useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { purgeSiteCache } from "@/app/(admin)/admin/(panel)/settings/actions";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import { Button } from "@/components/admin/ui/button";

/**
 * Forces the public site to re-render from the database right now. Saves
 * already do this for the pages they touch; this is the "I don't see my
 * change" escape hatch.
 */
export function PurgeCacheButton({ variant = "outline" as const }: { variant?: "outline" | "default" }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await runAction(purgeSiteCache);
          if (res.ok) toast.success("Public site refreshed.", { description: "Every page will re-render on its next visit." });
          else toastActionError(res);
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      Refresh public site
    </Button>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { runAction, toastActionError } from "@/components/admin/action-feedback";
import { Button } from "@/components/admin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";

export function ConfirmDialog({
  trigger,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
  open: controlledOpen,
  onOpenChange,
}: {
  /** Omit when driving the dialog from outside — e.g. an item in a menu that
   *  must close before the dialog mounts, or the two fight over focus. */
  trigger?: ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      const res = await runAction(onConfirm);
      if (res.ok) {
        toast.success("Done.");
        setOpen(false);
      } else {
        toastActionError(res);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { changePassword } from "@/app/(admin)/admin/(panel)/profile/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Field } from "@/components/admin/Field";

export function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (next !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    start(async () => {
      const res = await changePassword({ currentPassword: current, newPassword: next });
      if (res.ok) {
        toast.success("Password changed.");
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Current password">
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <Button onClick={submit} disabled={pending || !current || !next}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Puts the address on the clipboard and says so, for people who don't use a mail app. */
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard access can be refused (insecure context, permissions). The
      // address is printed right beside this button, so there is nothing more
      // useful to do than leave the visitor to select it.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-5 text-sm font-medium text-foreground transition-[border-color,background-color,transform] duration-300 hover:border-[color:var(--primary)]/50 hover:bg-[color:var(--muted)] active:scale-[0.97]",
        className
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-emerald-500" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      {copied ? "Copied" : "Copy address"}
      {/* A changed button label is not announced on its own. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound } from "lucide-react";
import type { DemoAccount } from "@/content/site";

/** One value with a copy button, so nobody has to retype a password. */
function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="min-w-0">
      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        aria-label={`Copy ${label.toLowerCase()}: ${value}`}
        className="group mt-0.5 inline-flex max-w-full items-center gap-1.5 rounded-md font-mono text-sm text-foreground/90 transition-colors hover:text-primary"
      >
        <span className="truncate">{value}</span>
        {copied ? (
          <Check className="size-3.5 shrink-0 text-emerald-500" />
        ) : (
          <Copy className="size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
}

/**
 * Credentials for the live demo. Most of these projects are role-based, so a
 * visitor who opens the demo lands on a public page with no way into the part
 * worth seeing; these logins are the way in.
 */
export function DemoAccess({
  accounts,
  demoUrl,
}: {
  accounts: DemoAccount[];
  demoUrl?: string;
}) {
  if (accounts.length === 0) return null;

  return (
    <section className="surface mt-10 rounded-3xl border border-[color:var(--border)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <KeyRound className="size-4 text-primary" aria-hidden="true" />
          Try the demo
        </h2>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            Open the demo
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in with any of these to explore the different roles.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
        {accounts.map((account) => (
          <li
            key={`${account.role}-${account.username ?? ""}`}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)]/30 p-4"
          >
            <p className="text-sm font-semibold">{account.role}</p>
            <div className="mt-3 grid gap-2.5">
              {account.username && <CopyValue label="Username" value={account.username} />}
              {account.password && <CopyValue label="Password" value={account.password} />}
            </div>
            {account.note && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{account.note}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

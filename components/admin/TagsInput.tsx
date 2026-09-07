"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Two shapes, because two very different kinds of list live behind this input.
 *
 * `variant="tag"` — short keyword chips (tech, SEO keywords, rotating roles).
 * A comma never belongs inside one of those, so it commits the entry.
 *
 * `variant="line"` — full sentences (experience highlights, service features).
 * Commas are ordinary punctuation there, so only Enter commits and each entry
 * is rendered as its own row instead of a chip.
 */
export function TagsInput({
  value,
  onChange,
  placeholder,
  variant = "tag",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  variant?: "tag" | "line";
}) {
  const [draft, setDraft] = useState("");
  const line = variant === "line";
  const hint =
    placeholder ?? (line ? "Write a line and press Enter…" : "Type and press Enter…");

  function add(entry: string) {
    const t = entry.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || (!line && e.key === ",")) {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const input = (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={() => draft && add(draft)}
      placeholder={line || value.length === 0 ? hint : ""}
      className={cn(
        "bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground",
        line ? "w-full py-1" : "min-w-[8rem] flex-1"
      )}
    />
  );

  if (line) {
    return (
      <div className="space-y-1.5">
        {value.map((entry, i) => (
          <div
            key={entry}
            className="flex items-start gap-2 rounded-lg border border-input bg-background px-3 py-2"
          >
            <span className="mt-0.5 w-4 shrink-0 font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <p className="flex-1 text-sm leading-relaxed">{entry}</p>
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== entry))}
              aria-label={`Remove "${entry}"`}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="rounded-lg border border-input bg-background px-2 py-1 focus-within:ring-2 focus-within:ring-ring">
          {input}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove ${tag}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {input}
    </div>
  );
}

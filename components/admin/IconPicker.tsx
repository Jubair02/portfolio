"use client";

import { ICON_NAMES, isIconName, type IconName } from "@/lib/icon-names";
import { DataIcon } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";

/** Sentinel for the "no icon" row — Radix Select forbids an empty item value. */
const NONE = "__none__";

type IconPickerProps = { value: string } & (
  | { optional?: false; onChange: (value: IconName) => void }
  /** `optional` widens onChange to include "" — the cleared state. */
  | { optional: true; onChange: (value: IconName | "") => void }
);

/**
 * Icon field. Only the names in ICON_NAMES render on the site, so this is a
 * closed list instead of free text — a typo used to fall back to Sparkles
 * without telling anyone.
 */
export function IconPicker({ value, onChange, optional = false }: IconPickerProps) {
  // A value stored before this picker existed may not be a real icon. Show the
  // placeholder rather than a name that would never render.
  const selected = isIconName(value) ? value : optional ? NONE : "";

  return (
    <Select
      value={selected}
      onValueChange={(v) =>
        (onChange as (value: IconName | "") => void)(v === NONE ? "" : (v as IconName))
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an icon" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {optional && (
          <SelectItem value={NONE}>
            <span className="text-muted-foreground">No icon</span>
          </SelectItem>
        )}
        {ICON_NAMES.map((name) => (
          <SelectItem key={name} value={name}>
            <span className="flex items-center gap-2">
              <DataIcon name={name} className="size-4 text-primary" />
              {name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

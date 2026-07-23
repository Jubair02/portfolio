import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = "primary",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  accent?: "primary" | "gold" | "accent";
  hint?: string;
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold",
    accent: "bg-accent/10 text-accent",
  }[accent];

  const inner = (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", accentClass)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

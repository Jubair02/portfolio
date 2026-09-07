"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
  onNavigate,
}: {
  user: { name?: string | null; email?: string | null };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent-2 text-sm font-bold text-primary-foreground">
          JH
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Portfolio CMS</p>
          <p className="text-xs text-muted-foreground">Admin panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <p className="truncate font-medium text-foreground/80">{user.name || "Admin"}</p>
        {user.email && <p className="truncate">{user.email}</p>}
      </div>
    </div>
  );
}

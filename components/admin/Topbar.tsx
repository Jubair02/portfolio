"use client";

import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Menu, Moon, Sun, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";

export function Topbar({
  onMenu,
  user,
}: {
  onMenu: () => void;
  user: { name?: string | null; email?: string | null };
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </Button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" asChild aria-label="View site">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
          </a>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-label="Account menu"
            >
              {(user.name ?? "A").charAt(0).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="truncate text-xs">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => signOut({ callbackUrl: "/admin/login" })}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

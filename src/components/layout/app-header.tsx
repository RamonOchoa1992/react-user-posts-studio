import { Layers3 } from "lucide-react";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AppHeaderProps {
  /** Page-specific actions rendered before the theme toggle. */
  actions?: ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <div
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md ring-1 shadow-indigo-500/25 ring-white/20 ring-inset"
        >
          <Layers3 className="size-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <h1 className="truncate text-sm font-semibold tracking-tight">User Posts Studio</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            Directorio y publicaciones · JSONPlaceholder
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

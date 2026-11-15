import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Illustrated empty state: a glowing icon on concentric rings over a dotted canvas. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center duration-300 motion-safe:animate-in motion-safe:fade-in-0",
        className,
      )}
    >
      <div aria-hidden className="relative mb-6 flex size-32 items-center justify-center">
        <div className="bg-dots absolute inset-0 rounded-full [mask-image:radial-gradient(circle,black_30%,transparent_70%)]" />
        <div className="absolute size-28 rounded-full border border-border/50" />
        <div className="absolute size-20 rounded-full border border-border/70" />
        <div className="absolute size-12 rounded-2xl bg-brand/20 blur-xl" />
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-muted-foreground shadow-sm">
          <Icon className="size-5" />
        </div>
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">{description}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

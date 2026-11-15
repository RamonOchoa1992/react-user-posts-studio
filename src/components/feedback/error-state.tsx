import { FileWarning, type LucideIcon, RotateCw, ServerCrash, TimerOff, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiError, ApiErrorKind } from "@/services/api-error";

const ICON_BY_KIND: Record<ApiErrorKind, LucideIcon> = {
  network: WifiOff,
  timeout: TimerOff,
  http: ServerCrash,
  "invalid-response": FileWarning,
};

interface ErrorStateProps {
  title: string;
  error: ApiError;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({ title, error, onRetry, className }: ErrorStateProps) {
  const Icon = ICON_BY_KIND[error.kind];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center duration-300 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
        className,
      )}
    >
      <div className="relative mb-5">
        <div aria-hidden className="absolute inset-0 rounded-2xl bg-destructive/25 blur-xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <Icon className="size-6" aria-hidden />
        </div>
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">{error.message}</p>
      <Button variant="outline" size="lg" onClick={onRetry} className="mt-5 gap-2 px-4 pointer-coarse:h-11">
        <RotateCw
          aria-hidden
          className="transition-transform duration-500 group-hover/button:rotate-180 motion-reduce:transition-none"
        />
        Reintentar
      </Button>
    </div>
  );
}

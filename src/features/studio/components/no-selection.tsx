import { UsersRound } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";

export function NoSelection() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={UsersRound}
        title="Selecciona un usuario"
        description={
          <>
            Explora su perfil, sus métricas clave y su feed de publicaciones. Pulsa{" "}
            <kbd className="rounded-md border border-border bg-muted px-1.5 font-mono text-[11px] text-foreground">
              /
            </kbd>{" "}
            para buscar.
          </>
        }
      />
    </div>
  );
}

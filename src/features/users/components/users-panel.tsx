"use client";

import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResourceState } from "@/hooks/use-async-resource";
import { matchesQuery } from "@/lib/search";
import { cn } from "@/lib/utils";

import type { User } from "../types";
import { UserCard } from "./user-card";
import { UserCardSkeleton } from "./user-card-skeleton";
import { UserSearch } from "./user-search";

const SKELETON_COUNT = 7;

interface UsersPanelProps {
  state: ResourceState<User[]>;
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
  onRetry: () => void;
  className?: string;
}

export function UsersPanel({ state, selectedUserId, onSelectUser, onRetry, className }: UsersPanelProps) {
  const [query, setQuery] = useState("");

  const users = state.status === "success" ? state.data : null;
  const visibleUsers = useMemo(() => users?.filter((user) => matchesQuery(user.name, query)) ?? [], [users, query]);
  const isFiltering = query.trim().length > 0;

  return (
    <aside
      aria-label="Usuarios"
      className={cn(
        "flex min-h-0 flex-col bg-background duration-300 max-lg:motion-safe:animate-in max-lg:motion-safe:fade-in-0 max-lg:motion-safe:slide-in-from-left-6",
        className,
      )}
    >
      <div className="space-y-3 border-b border-border/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Usuarios</h2>
            <p className="text-xs text-muted-foreground">Selecciona un perfil para ver su actividad</p>
          </div>
          {users ? (
            <Badge variant="secondary" aria-live="polite" className="tabular-nums">
              {isFiltering ? `${visibleUsers.length} de ${users.length}` : `${users.length} usuarios`}
            </Badge>
          ) : state.status === "loading" ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : null}
        </div>
        <UserSearch value={query} onChange={setQuery} />
      </div>

      <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto overscroll-contain p-2">
        {state.status === "loading" ? (
          <div role="status" aria-label="Cargando usuarios" className="space-y-1">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <UserCardSkeleton key={index} />
            ))}
          </div>
        ) : state.status === "error" ? (
          <ErrorState title="No pudimos cargar los usuarios" error={state.error} onRetry={onRetry} />
        ) : visibleUsers.length === 0 && isFiltering ? (
          <EmptyState
            icon={SearchX}
            title="Sin coincidencias"
            description={
              <>
                Ningún usuario coincide con <span className="font-medium text-foreground">“{query.trim()}”</span>.
              </>
            }
            action={
              <Button variant="outline" onClick={() => setQuery("")} className="pointer-coarse:h-11">
                Ver todos los usuarios
              </Button>
            }
          />
        ) : (
          <ul className="space-y-1">
            {visibleUsers.map((user) => (
              <li key={user.id}>
                <UserCard user={user} query={query} isSelected={user.id === selectedUserId} onSelect={onSelectUser} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

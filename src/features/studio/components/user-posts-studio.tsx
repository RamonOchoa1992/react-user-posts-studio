"use client";

import { Zap } from "lucide-react";
import { useCallback } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UsersPanel, useUsers } from "@/features/users";

import { useSelectedUserId } from "../hooks/use-selected-user-id";
import { NoSelection } from "./no-selection";

/**
 * Composition root of the master-detail experience. It owns cross-feature
 * state (the selection) and wires the features together; the features
 * themselves never import each other.
 */
export function UserPostsStudio() {
  const { state: usersState, retry: retryUsers, simulateFailure } = useUsers();
  const [selectedUserId, setSelectedUserId] = useSelectedUserId();

  const selectedUser =
    usersState.status === "success" ? (usersState.data.find((user) => user.id === selectedUserId) ?? null) : null;

  const handleSelectUser = useCallback((userId: number) => setSelectedUserId(userId), [setSelectedUserId]);

  return (
    <div className="flex h-dvh flex-col">
      <AppHeader
        actions={
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  onClick={simulateFailure}
                  aria-label="Simular error de red"
                  className="gap-1.5 pointer-coarse:h-10 max-sm:pointer-coarse:w-10"
                />
              }
            >
              <Zap aria-hidden className="text-amber-500" />
              <span className="hidden sm:inline">Simular error</span>
            </TooltipTrigger>
            <TooltipContent>Fuerza un fallo de red al cargar los usuarios</TooltipContent>
          </Tooltip>
        }
      />

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <UsersPanel
          state={usersState}
          selectedUserId={selectedUser?.id ?? null}
          onSelectUser={handleSelectUser}
          onRetry={retryUsers}
          className="lg:border-r lg:border-border/60"
        />

        <section aria-label="Detalle del usuario" className="bg-spotlight hidden min-h-0 lg:block">
          <NoSelection />
        </section>
      </main>
    </div>
  );
}

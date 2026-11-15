"use client";

import { ArrowLeft, Zap } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type CreatePostValues,
  type FeedPost,
  PostFeed,
  useCreatedPosts,
  type UseCreatedPostsResult,
  useUserPosts,
} from "@/features/posts";
import { type User, UserAvatar, UserProfile, UsersPanel, useUsers } from "@/features/users";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { toApiError } from "@/services/api-error";

import { useSelectedUserId } from "../hooks/use-selected-user-id";
import { NoSelection } from "./no-selection";

/**
 * Composition root of the master-detail experience. It owns cross-feature
 * state (selection, session-created posts) and wires the features together;
 * the features themselves never import each other.
 */
export function UserPostsStudio() {
  const { state: usersState, retry: retryUsers, simulateFailure } = useUsers();
  const [selectedUserId, setSelectedUserId] = useSelectedUserId();
  // Lives here, above the keyed detail view, so created posts survive profile switches.
  const { getCreatedPosts, publish } = useCreatedPosts();

  const selectedUser =
    usersState.status === "success" ? (usersState.data.find((user) => user.id === selectedUserId) ?? null) : null;

  const handleSelectUser = useCallback((userId: number) => setSelectedUserId(userId), [setSelectedUserId]);
  const handleBack = useCallback(() => setSelectedUserId(null), [setSelectedUserId]);

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
          className={cn("lg:border-r lg:border-border/60", selectedUser && "hidden lg:flex")}
        />

        <section
          aria-label="Detalle del usuario"
          className={cn("bg-spotlight min-h-0", !selectedUser && "hidden lg:block")}
        >
          {selectedUser ? (
            <UserDetail
              key={selectedUser.id}
              user={selectedUser}
              createdPosts={getCreatedPosts(selectedUser.id)}
              onPublish={publish}
              onBack={handleBack}
            />
          ) : (
            <NoSelection />
          )}
        </section>
      </main>
    </div>
  );
}

interface UserDetailProps {
  user: User;
  createdPosts: readonly FeedPost[];
  onPublish: UseCreatedPostsResult["publish"];
  onBack: () => void;
}

/** Keyed by user: switching profiles remounts it, resetting scroll, drafts and replaying the entrance. */
function UserDetail({ user, createdPosts, onPublish, onBack }: UserDetailProps) {
  const { state: postsState, reload: reloadPosts } = useUserPosts(user.id);
  const nameRef = useRef<HTMLHeadingElement>(null);
  // App header (56px) + sticky mobile bar (56px): the name counts as hidden once it slides beneath them.
  const isNameVisible = useInView(nameRef, "-112px 0px 0px 0px");

  const postsCount = postsState.status === "success" ? postsState.data.length + createdPosts.length : null;

  const handleCreatePost = (values: CreatePostValues) => {
    const firstName = user.name.split(" ")[0] ?? user.name;
    toast.promise(onPublish(user.id, values), {
      loading: "Publicando…",
      success: `Publicado en el perfil de ${firstName}`,
      error: (error: unknown) => toApiError(error).message,
    });
  };

  return (
    <div className="h-full scrollbar-thin overflow-y-auto overscroll-contain">
      {/* Phones/tablets: sticky navigation bar; the compact identity fades in once the big name scrolls away. */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-2 backdrop-blur-xl lg:hidden">
        <Button variant="ghost" onClick={onBack} className="h-10 gap-1.5 px-2.5">
          <ArrowLeft aria-hidden />
          Volver
        </Button>
        <div
          aria-hidden={isNameVisible}
          className={cn(
            "ml-auto flex min-w-0 items-center gap-2 pr-2 transition-[opacity,translate] duration-200",
            isNameVisible ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          <span className="truncate text-sm font-medium">{user.name}</span>
          <UserAvatar name={user.name} seed={user.username} size="sm" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 p-4 pb-28 duration-300 motion-safe:animate-in motion-safe:fade-in-0 max-lg:motion-safe:slide-in-from-right-8 sm:p-6 lg:p-8 lg:motion-safe:slide-in-from-bottom-2">
        <UserProfile
          user={user}
          nameRef={nameRef}
          postsCount={postsCount}
          isPostsCountLoading={postsState.status === "loading"}
        />
        <PostFeed
          authorName={user.name}
          state={postsState}
          createdPosts={createdPosts}
          onRetry={reloadPosts}
          onCreatePost={handleCreatePost}
        />
      </div>
    </div>
  );
}

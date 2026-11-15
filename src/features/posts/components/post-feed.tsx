"use client";

import { Inbox } from "lucide-react";
import { useMemo } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import type { ResourceState } from "@/hooks/use-async-resource";

import type { CreatePostValues } from "../schemas";
import type { FeedPost, Post } from "../types";
import { CreatePostDialog } from "./create-post-dialog";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

const SKELETON_COUNT = 3;
const NO_POSTS: readonly Post[] = [];

function toFeedPost(post: Post): FeedPost {
  return { ...post, key: `remote-${post.id}`, isNew: false, isPending: false };
}

interface PostFeedProps {
  authorName: string;
  state: ResourceState<Post[]>;
  /** Posts created in this session, newest first; always rendered on top. */
  createdPosts: readonly FeedPost[];
  onRetry: () => void;
  onCreatePost: (values: CreatePostValues) => void;
}

export function PostFeed({ authorName, state, createdPosts, onRetry, onCreatePost }: PostFeedProps) {
  const remotePosts = state.status === "success" ? state.data : NO_POSTS;
  const feed = useMemo(() => [...createdPosts, ...remotePosts.map(toFeedPost)], [createdPosts, remotePosts]);
  const firstName = authorName.split(" ")[0] ?? authorName;

  return (
    <section aria-labelledby="feed-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="feed-title" className="text-base font-semibold tracking-tight">
            Publicaciones
          </h3>
          <p className="text-sm text-muted-foreground">Lo último que ha compartido {firstName}.</p>
        </div>
        <CreatePostDialog authorName={authorName} onSubmit={onCreatePost} />
      </div>

      {feed.length > 0 ? (
        <ol aria-label={`Publicaciones de ${authorName}`} className="space-y-3">
          {feed.map((post, index) => (
            <li key={post.key}>
              <PostCard post={post} index={index} />
            </li>
          ))}
        </ol>
      ) : null}

      {state.status === "loading" ? (
        <div role="status" aria-label="Cargando publicaciones" className="space-y-3">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : state.status === "error" ? (
        <div className="rounded-xl border border-dashed border-border">
          <ErrorState title="No pudimos cargar las publicaciones" error={state.error} onRetry={onRetry} />
        </div>
      ) : state.status === "success" && feed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border">
          <EmptyState
            icon={Inbox}
            title="Aún no hay publicaciones"
            description={`Sé el primero en publicar algo en el perfil de ${firstName}.`}
          />
        </div>
      ) : null}
    </section>
  );
}

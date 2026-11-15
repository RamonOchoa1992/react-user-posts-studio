"use client";

import { useCallback } from "react";

import { type AsyncResource, useAsyncResource } from "@/hooks/use-async-resource";

import { getUserPosts } from "../services/posts-service";
import type { Post } from "../types";

/** Posts of the selected user; idle while nobody is selected. */
export function useUserPosts(userId: number | null): AsyncResource<Post[]> {
  const load = useCallback(
    (signal: AbortSignal) => (userId === null ? Promise.resolve<Post[]>([]) : getUserPosts(userId, signal)),
    [userId],
  );
  return useAsyncResource(userId === null ? null : `posts:${userId}`, load);
}

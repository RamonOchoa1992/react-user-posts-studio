"use client";

import { useCallback, useState } from "react";

import { toApiError } from "@/services/api-error";

import type { CreatePostValues } from "../schemas";
import { createPost } from "../services/posts-service";
import type { FeedPost } from "../types";

const NO_POSTS: readonly FeedPost[] = [];

let localSequence = 0;
function nextLocalKey(): string {
  localSequence += 1;
  return `local-${localSequence}`;
}

export interface UseCreatedPostsResult {
  getCreatedPosts: (userId: number) => readonly FeedPost[];
  /**
   * Optimistic create: the post is inserted immediately as pending, confirmed
   * with the server payload on success and rolled back on failure (the error
   * is re-thrown so the caller can surface it).
   */
  publish: (userId: number, values: CreatePostValues) => Promise<FeedPost>;
}

/**
 * Session store for posts created by the user, keyed by author. It lives above
 * the detail view so new posts survive switching between profiles.
 */
export function useCreatedPosts(): UseCreatedPostsResult {
  const [postsByUser, setPostsByUser] = useState<Readonly<Record<number, readonly FeedPost[]>>>({});

  const updateUserPosts = useCallback((userId: number, update: (posts: readonly FeedPost[]) => readonly FeedPost[]) => {
    setPostsByUser((current) => ({ ...current, [userId]: update(current[userId] ?? NO_POSTS) }));
  }, []);

  const publish = useCallback(
    async (userId: number, values: CreatePostValues): Promise<FeedPost> => {
      const key = nextLocalKey();
      const optimistic: FeedPost = { key, id: 0, userId, ...values, isNew: true, isPending: true };
      updateUserPosts(userId, (posts) => [optimistic, ...posts]);

      try {
        const saved = await createPost({ userId, ...values });
        const confirmed: FeedPost = { ...saved, key, isNew: true, isPending: false };
        updateUserPosts(userId, (posts) => posts.map((post) => (post.key === key ? confirmed : post)));
        return confirmed;
      } catch (error) {
        updateUserPosts(userId, (posts) => posts.filter((post) => post.key !== key));
        throw toApiError(error);
      }
    },
    [updateUserPosts],
  );

  const getCreatedPosts = useCallback((userId: number) => postsByUser[userId] ?? NO_POSTS, [postsByUser]);

  return { getCreatedPosts, publish };
}

import { request } from "@/services/http-client";

import { postResponseSchema, postsResponseSchema } from "../schemas";
import type { NewPost, Post } from "../types";

export function getUserPosts(userId: number, signal?: AbortSignal): Promise<Post[]> {
  const query = new URLSearchParams({ userId: String(userId) });
  return request(`/posts?${query.toString()}`, postsResponseSchema, { signal });
}

export function createPost(post: NewPost, signal?: AbortSignal): Promise<Post> {
  return request("/posts", postResponseSchema, { method: "POST", body: post, signal });
}

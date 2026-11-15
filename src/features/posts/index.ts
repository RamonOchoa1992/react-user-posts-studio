/** Public API of the posts feature. Import from "@/features/posts" only. */
export { PostFeed } from "./components/post-feed";
export { useCreatedPosts, type UseCreatedPostsResult } from "./hooks/use-created-posts";
export { useUserPosts } from "./hooks/use-user-posts";
export type { CreatePostValues } from "./schemas";
export type { FeedPost, NewPost, Post } from "./types";

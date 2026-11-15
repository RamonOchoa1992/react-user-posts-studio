export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, "id">;

/**
 * A post as rendered in the feed. Posts created in this session carry a
 * client-side key because JSONPlaceholder answers every POST with `id: 101`,
 * so the server id cannot be used as a stable React key.
 */
export interface FeedPost extends Post {
  key: string;
  isNew: boolean;
  isPending: boolean;
}

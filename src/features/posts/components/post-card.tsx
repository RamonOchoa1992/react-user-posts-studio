import { LoaderCircle, Sparkles } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { FeedPost } from "../types";

const MAX_STAGGERED_ITEMS = 8;
const STAGGER_STEP_MS = 35;

interface PostCardProps {
  post: FeedPost;
  /** Position in the feed, used to stagger the entrance animation. */
  index: number;
}

export const PostCard = memo(function PostCard({ post, index }: PostCardProps) {
  return (
    <article
      aria-busy={post.isPending || undefined}
      style={{ animationDelay: `${Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER_STEP_MS}ms` }}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-xs sm:p-5",
        "transition-[box-shadow,border-color,opacity] duration-200 hover:shadow-md",
        "fill-mode-both motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2",
        post.isNew
          ? "border-brand/30 bg-linear-to-br from-brand/5 to-card ring-1 ring-brand/10"
          : "border-border/60 hover:border-border",
        post.isPending && "opacity-75",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <h4 className="text-[15px] leading-snug font-semibold tracking-tight first-letter:uppercase">{post.title}</h4>
        {post.isNew ? (
          <Badge variant="outline" className="shrink-0 border-brand/25 bg-brand/10 text-brand">
            {post.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
            Nuevo
          </Badge>
        ) : null}
      </header>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground first-letter:uppercase">
        {post.body}
      </p>
      {post.isPending ? <p className="sr-only">Publicando…</p> : null}
    </article>
  );
});

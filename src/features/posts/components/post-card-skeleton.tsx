import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors `PostCard` geometry: title line, three body lines, same paddings and radius. */
export function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs sm:p-5">
      <Skeleton className="h-4.5 w-3/4" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

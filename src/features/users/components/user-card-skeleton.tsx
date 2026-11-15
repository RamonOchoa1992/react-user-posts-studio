import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors `UserCard` geometry (padding, avatar, two text lines, chevron) to avoid layout shift. */
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-transparent p-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-44 max-w-full" />
      </div>
      <Skeleton className="size-4 shrink-0 rounded-sm" />
    </div>
  );
}

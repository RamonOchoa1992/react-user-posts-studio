import { ChevronRight } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { User } from "../types";
import { HighlightedText } from "./highlighted-text";
import { UserAvatar } from "./user-avatar";

interface UserCardProps {
  user: User;
  query: string;
  isSelected: boolean;
  onSelect: (userId: number) => void;
}

export const UserCard = memo(function UserCard({ user, query, isSelected, onSelect }: UserCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none",
        "transition-[translate,scale,box-shadow,background-color,border-color] duration-200 ease-out",
        "focus-visible:ring-3 focus-visible:ring-ring motion-safe:active:scale-[0.985]",
        "hover:shadow-lg hover:shadow-foreground/5 motion-safe:hover:-translate-y-0.5 dark:hover:shadow-black/40",
        isSelected
          ? "border-brand/35 bg-card shadow-md ring-1 shadow-brand/5 ring-brand/15"
          : "border-transparent hover:border-border/60 hover:bg-card",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-0 w-0.5 rounded-full bg-brand transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0",
        )}
      />
      <UserAvatar name={user.name} seed={user.username} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          <HighlightedText text={user.name} query={query} />
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          @{user.username} · {user.company.name}
        </span>
      </span>
      <ChevronRight
        aria-hidden
        className={cn(
          "size-4 shrink-0 text-muted-foreground/50 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground",
          isSelected && "text-brand group-hover:text-brand",
        )}
      />
    </button>
  );
});

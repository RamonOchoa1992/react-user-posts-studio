import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarGradient, getInitials, toCssGradient } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

interface UserAvatarProps {
  name: string;
  /** Stable identity used to derive the gradient (e.g. the username). */
  seed: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

/** Decorative avatar: the user's name is always rendered next to it. */
export function UserAvatar({ name, seed, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar aria-hidden className={cn("after:hidden", SIZE_CLASSES[size], className)}>
      <AvatarFallback
        className="bg-transparent font-semibold tracking-wide text-white text-shadow-xs"
        style={{ backgroundImage: toCssGradient(getAvatarGradient(seed)) }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

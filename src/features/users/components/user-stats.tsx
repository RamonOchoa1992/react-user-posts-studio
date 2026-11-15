import { ArrowUpRight, Building2, FileText, Globe, type LucideIcon, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import type { User } from "../types";

function toExternalUrl(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

interface UserStatsProps {
  user: User;
  postsCount: number | null;
  isPostsCountLoading: boolean;
}

export function UserStats({ user, postsCount, isPostsCountLoading }: UserStatsProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        icon={FileText}
        label="Publicaciones"
        hint="En este perfil"
        value={
          isPostsCountLoading ? (
            <Skeleton className="h-6 w-8" />
          ) : (
            <span className="text-2xl tabular-nums">{postsCount ?? "—"}</span>
          )
        }
      />
      <StatCard icon={Building2} label="Empresa" value={user.company.name} hint={user.company.bs} />
      <StatCard
        icon={MapPin}
        label="Ciudad"
        value={user.address.city}
        hint={`${user.address.street}, ${user.address.suite}`}
      />
      <StatCard
        icon={Globe}
        label="Web"
        hint="Sitio personal"
        value={
          <a
            href={toExternalUrl(user.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex max-w-full items-center gap-1 outline-none hover:text-brand focus-visible:text-brand pointer-coarse:-my-2.5 pointer-coarse:py-2.5"
          >
            <span className="truncate">{user.website}</span>
            <ArrowUpRight
              aria-hidden
              className="size-3.5 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            />
          </a>
        }
      />
    </dl>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint: string;
}

function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="group flex min-w-0 flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-shadow duration-200 hover:shadow-md">
      {/* dt/dd must be direct children of the group for assistive tech to pair label and value. */}
      <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/10 group-hover:text-brand"
        >
          <Icon className="size-3.5" />
        </span>
        {label}
      </dt>
      <dd className="min-w-0">
        <div className="flex min-h-7 items-center truncate text-[15px] font-semibold tracking-tight">{value}</div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground first-letter:uppercase" title={hint}>
          {hint}
        </p>
      </dd>
    </div>
  );
}

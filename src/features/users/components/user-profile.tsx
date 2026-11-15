import { Mail, Phone, Quote } from "lucide-react";
import type { ReactNode, Ref } from "react";

import { CopyButton } from "@/components/copy-button";
import { getAvatarGradient, toCssGradient } from "@/lib/avatar";

import type { User } from "../types";
import { UserAvatar } from "./user-avatar";
import { UserStats } from "./user-stats";

interface UserProfileProps {
  user: User;
  /** Lets the host observe the name, e.g. to reveal a compact title once it scrolls away. */
  nameRef?: Ref<HTMLHeadingElement>;
  /** `null` while the count is unknown (loading or failed). */
  postsCount: number | null;
  isPostsCountLoading: boolean;
}

export function UserProfile({ user, nameRef, postsCount, isPostsCountLoading }: UserProfileProps) {
  return (
    <div className="space-y-4">
      <section
        aria-labelledby="profile-name"
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs"
      >
        <div aria-hidden className="relative h-24 sm:h-28">
          <div
            className="absolute inset-0 opacity-80 dark:opacity-60"
            style={{ backgroundImage: toCssGradient(getAvatarGradient(user.username)) }}
          />
          <div className="bg-dots absolute inset-0 opacity-60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-card/40" />
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <UserAvatar name={user.name} seed={user.username} size="xl" className="-mt-10 shadow-lg ring-4 ring-card" />
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 ref={nameRef} id="profile-name" className="text-2xl font-semibold tracking-tight text-balance">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ContactChip
                icon={<Mail className="size-3.5" aria-hidden />}
                href={`mailto:${user.email}`}
                value={user.email}
                copyLabel="Copiar email"
                copiedMessage="Email copiado"
              />
              <ContactChip
                icon={<Phone className="size-3.5" aria-hidden />}
                href={`tel:${user.phone.replace(/[^\d+]/g, "")}`}
                value={user.phone}
                copyLabel="Copiar teléfono"
                copiedMessage="Teléfono copiado"
              />
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground italic">
            <Quote className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
            <span className="first-letter:uppercase">{user.company.catchPhrase}</span>
          </p>
        </div>
      </section>

      <UserStats user={user} postsCount={postsCount} isPostsCountLoading={isPostsCountLoading} />
    </div>
  );
}

interface ContactChipProps {
  icon: ReactNode;
  href: string;
  value: string;
  copyLabel: string;
  copiedMessage: string;
}

function ContactChip({ icon, href, value, copyLabel, copiedMessage }: ContactChipProps) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-background/60 py-1 pr-1 pl-3 text-sm shadow-xs">
      <span className="text-muted-foreground">{icon}</span>
      <a
        href={href}
        className="truncate underline-offset-4 outline-none hover:underline focus-visible:underline pointer-coarse:-my-3 pointer-coarse:py-3"
      >
        {value}
      </a>
      <CopyButton value={value} label={copyLabel} successMessage={copiedMessage} />
    </div>
  );
}

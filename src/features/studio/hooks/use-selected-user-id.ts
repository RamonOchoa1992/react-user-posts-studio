"use client";

import { useCallback, useSyncExternalStore } from "react";

const USER_PARAM = "user";
/** History API calls do not emit events, so same-document navigations announce themselves. */
const SELECTION_CHANGE_EVENT = "studio:selection-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(SELECTION_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(SELECTION_CHANGE_EVENT, onChange);
  };
}

export function parseUserId(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const userId = Number(raw);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}

function getSnapshot(): number | null {
  return parseUserId(new URLSearchParams(window.location.search).get(USER_PARAM));
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * The selected user lives in the URL (`?user=3`): selections are shareable,
 * survive reloads and the browser/OS back gesture walks back through them.
 * Uses the native History API, which Next.js integrates with its router.
 */
export function useSelectedUserId(): readonly [number | null, (userId: number | null) => void] {
  const selectedUserId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSelectedUserId = useCallback((userId: number | null) => {
    const url = new URL(window.location.href);
    if (userId === null) url.searchParams.delete(USER_PARAM);
    else url.searchParams.set(USER_PARAM, String(userId));
    if (url.href === window.location.href) return;

    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event(SELECTION_CHANGE_EVENT));
  }, []);

  return [selectedUserId, setSelectedUserId] as const;
}

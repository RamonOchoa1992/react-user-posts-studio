"use client";

import { useCallback, useEffect, useState } from "react";

import { type ApiError, isAbortError, toApiError } from "@/services/api-error";

export type ResourceState<T> =
  { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: ApiError };

type SettledResult<T> = { requestId: string } & ({ status: "success"; data: T } | { status: "error"; error: ApiError });

export type ResourceLoader<T> = (signal: AbortSignal) => Promise<T>;

export interface AsyncResource<T> {
  state: ResourceState<T>;
  reload: () => void;
}

const IDLE: ResourceState<never> = { status: "idle" };
const LOADING: ResourceState<never> = { status: "loading" };

/**
 * Minimal fetch-by-key primitive.
 *
 * "Loading" is derived (there is no settled result for the current request id
 * yet) instead of being set inside the effect. That keeps renders pure and
 * makes race conditions structurally impossible: a late response for a
 * previous key is tagged with its own request id and is simply never shown.
 * In-flight requests are also aborted when the key changes or on unmount.
 *
 * Contract: `load` must be referentially stable for a given `key`; build both
 * from the same inputs (e.g. `useCallback(..., [userId])` + `posts:${userId}`).
 */
export function useAsyncResource<T>(key: string | null, load: ResourceLoader<T>): AsyncResource<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledResult<T> | null>(null);
  const requestId = key === null ? null : `${key}#${attempt}`;

  useEffect(() => {
    if (requestId === null) return;
    const controller = new AbortController();

    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSettled({ requestId, status: "success", data });
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setSettled({ requestId, status: "error", error: toApiError(error) });
      },
    );

    return () => controller.abort();
  }, [requestId, load]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  let state: ResourceState<T>;
  if (requestId === null) state = IDLE;
  else if (settled !== null && settled.requestId === requestId) state = settled;
  else state = LOADING;

  return { state, reload };
}

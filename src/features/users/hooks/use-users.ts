"use client";

import { useCallback, useState } from "react";

import { type ResourceState, useAsyncResource } from "@/hooks/use-async-resource";
import { simulateNetworkFailure } from "@/services/fault-injection";

import { getUsers } from "../services/users-service";
import type { User } from "../types";

type UsersSource = "api" | "simulated-failure";

export interface UseUsersResult {
  state: ResourceState<User[]>;
  retry: () => void;
  /** Forces the next load to fail like a dropped connection (demo of the error flow). */
  simulateFailure: () => void;
}

export function useUsers(): UseUsersResult {
  const [source, setSource] = useState<UsersSource>("api");

  const load = useCallback(
    (signal: AbortSignal) => (source === "api" ? getUsers(signal) : simulateNetworkFailure(signal)),
    [source],
  );
  const { state, reload } = useAsyncResource(`users:${source}`, load);

  const retry = useCallback(() => {
    setSource("api");
    reload();
  }, [reload]);

  const simulateFailure = useCallback(() => {
    setSource("simulated-failure");
    reload();
  }, [reload]);

  return { state, retry, simulateFailure };
}

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/services/api-error";

import { type ResourceLoader, useAsyncResource } from "./use-async-resource";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAsyncResource", () => {
  it("is idle without a key and does not load", () => {
    let calls = 0;
    const load: ResourceLoader<string> = () => {
      calls += 1;
      return Promise.resolve("never");
    };

    const { result } = renderHook(() => useAsyncResource(null, load));

    expect(result.current.state).toEqual({ status: "idle" });
    expect(calls).toBe(0);
  });

  it("never shows a stale response after the key changes (race condition guard)", async () => {
    const requests = new Map<string, Deferred<string>>();
    const signals = new Map<string, AbortSignal>();
    const loaders = new Map<string, ResourceLoader<string>>();
    const loaderFor = (key: string): ResourceLoader<string> => {
      const existing = loaders.get(key);
      if (existing) return existing;
      const loader: ResourceLoader<string> = (signal) => {
        const request = deferred<string>();
        requests.set(key, request);
        signals.set(key, signal);
        return request.promise;
      };
      loaders.set(key, loader);
      return loader;
    };

    const { result, rerender } = renderHook(({ key }) => useAsyncResource(key, loaderFor(key)), {
      initialProps: { key: "user-1" },
    });
    rerender({ key: "user-2" });

    expect(signals.get("user-1")?.aborted).toBe(true);

    await act(async () => requests.get("user-1")?.resolve("posts of user 1"));
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => requests.get("user-2")?.resolve("posts of user 2"));
    expect(result.current.state).toMatchObject({ status: "success", data: "posts of user 2" });
  });

  it("exposes failures as ApiError and reloads on demand", async () => {
    let attempt = 0;
    const load: ResourceLoader<string> = () => {
      attempt += 1;
      return attempt === 1 ? Promise.reject(new ApiError("http", "boom", { status: 500 })) : Promise.resolve("ok");
    };

    const { result } = renderHook(() => useAsyncResource("resource", load));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    act(() => result.current.reload());
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state).toMatchObject({ status: "success", data: "ok" }));
  });
});

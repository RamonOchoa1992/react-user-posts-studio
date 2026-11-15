import type { z } from "zod";

import { ApiError, describeHttpStatus } from "./api-error";

export const API_BASE_URL = "https://jsonplaceholder.typicode.com";
export const DEFAULT_TIMEOUT_MS = 10_000;

type HttpMethod = "GET" | "POST";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Caller-owned cancellation (e.g. the user switched to another profile). */
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Typed fetch wrapper: enforces a timeout, normalises every failure into an
 * `ApiError` and validates the payload at runtime, so a contract change in the
 * API fails loudly here instead of crashing a component deep in the tree.
 *
 * Caller cancellations are re-thrown untouched (as `AbortError`) so hooks can
 * tell "the user moved on" apart from a real failure.
 */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = "GET", body, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();

  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers:
        body === undefined
          ? { Accept: "application/json" }
          : { Accept: "application/json", "Content-Type": "application/json; charset=UTF-8" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError("http", describeHttpStatus(response.status), { status: response.status });
    }

    const payload: unknown = await response.json().catch((cause: unknown) => {
      throw new ApiError("invalid-response", "La respuesta del servidor no es JSON válido.", { cause });
    });

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError("invalid-response", "La respuesta del servidor no tiene el formato esperado.", {
        cause: parsed.error,
      });
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) {
      throw new ApiError("timeout", `El servidor no respondió en ${timeoutMs / 1000} s. Inténtalo de nuevo.`, {
        cause: error,
      });
    }
    if (signal?.aborted) throw error;
    throw new ApiError("network", "No pudimos conectar con el servidor. Revisa tu conexión.", { cause: error });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

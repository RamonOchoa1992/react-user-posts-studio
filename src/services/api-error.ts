export type ApiErrorKind = "http" | "network" | "timeout" | "invalid-response";

interface ApiErrorOptions {
  status?: number;
  cause?: unknown;
}

/** Single error type surfaced by the service layer, so the UI only handles one shape. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
  }
}

/** Duck-typed on purpose: `DOMException` is not an `Error` subclass in every runtime. */
export function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError("network", "Ocurrió un error inesperado. Inténtalo de nuevo.", {
    cause: error,
  });
}

export function describeHttpStatus(status: number): string {
  if (status === 404) return "No encontramos el recurso solicitado (404).";
  if (status === 429) return "Demasiadas peticiones seguidas. Espera un momento (429).";
  if (status >= 500) return `El servidor tuvo un problema (${status}). Inténtalo de nuevo en unos segundos.`;
  return `El servidor rechazó la petición (${status}).`;
}

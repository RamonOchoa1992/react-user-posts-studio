import { ApiError } from "./api-error";

export const SIMULATED_FAILURE_DELAY_MS = 700;

/**
 * Rejects like a dropped connection after a short, realistic delay. Lets the
 * error/retry flow be demoed on demand without touching the real client.
 */
export function simulateNetworkFailure(
  signal?: AbortSignal,
  delayMs: number = SIMULATED_FAILURE_DELAY_MS,
): Promise<never> {
  return new Promise((_resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new ApiError("network", "Fallo de red simulado: no pudimos conectar con el servidor."));
    }, delayMs);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException("The operation was aborted.", "AbortError"));
      },
      { once: true },
    );
  });
}

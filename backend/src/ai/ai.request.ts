/** Por intento; el plazo total también incluye las pausas entre reintentos. */
export const AI_CLIENT_OPTIONS = { timeout: 45_000, maxRetries: 1 };
const TOTAL_TIMEOUT_MS = 100_000;

/** Cancela la petición al SDK antes de los 120 s de nginx, incluso en Retry-After. */
export async function withAiDeadline<T>(
  request: (signal: AbortSignal) => PromiseLike<T>,
): Promise<T> {
  const signal = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
  try {
    return await request(signal);
  } catch (error) {
    // Los SDK convierten la cancelación en APIUserAbortError: conservamos su causa.
    if (signal.aborted) throw signal.reason;
    throw error;
  }
}

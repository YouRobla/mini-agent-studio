/**
 * Dirección de la API. Por defecto `/api` en el mismo origen que la página: en
 * desarrollo el proxy de Vite (`vite.config.ts`) lo reenvía al backend, así que
 * no hay CORS. `VITE_API_URL` permite apuntar directamente al backend.
 */
const API_URL: string = import.meta.env.VITE_API_URL || "/api";

const CONNECTION_ERROR =
  "No se pudo conectar con el servidor. Comprueba que el backend esté en marcha e inténtalo de nuevo.";

interface ApiErrorDetail {
  field: string;
  message: string;
}

/** Forma única de los errores que devuelve el backend. */
interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
}

/** Error de la API con un mensaje listo para mostrar al usuario. */
class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      // Solo las peticiones con cuerpo (POST, PUT) envían JSON y lo declaran.
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    // fetch solo falla así cuando no hay respuesta: servidor caído o sin red.
    throw new ApiError(0, "NETWORK_ERROR", CONNECTION_ERROR);
  }

  // 204: la operación fue correcta y no hay cuerpo que leer (p. ej. DELETE).
  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = body as Partial<ApiErrorBody> | null;
    // El backend siempre responde sus errores con este formato. Si no llega, no
    // respondió él: por ejemplo, el proxy de Vite devuelve 502 sin cuerpo cuando
    // el backend está apagado.
    if (typeof error?.message !== "string") {
      throw new ApiError(response.status, "NETWORK_ERROR", CONNECTION_ERROR);
    }
    throw new ApiError(
      response.status,
      error.error ?? "UNKNOWN_ERROR",
      error.message,
      error.details,
    );
  }

  return body as T;
}

/** Mensaje legible para cualquier error, venga o no de la API. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

/** true si el servidor respondió que el recurso no existe (404). */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** Mensaje del servidor para un campo concreto, si el error lo trae. */
export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  return error.details.find((detail) => detail.field === field)?.message;
}

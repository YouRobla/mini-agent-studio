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

/**
 * Textos propios para los códigos de error cuyo mensaje está pensado para quien
 * usa la API. El 404 del backend incluye el id («No existe un agente con el id
 * "1c4c…"»): útil en Swagger, pero no dice nada a quien usa la interfaz.
 */
const FRIENDLY_MESSAGES: Record<string, string> = {
  AGENT_NOT_FOUND:
    "Este agente ya no existe. Puede que se eliminara desde otra pestaña.",
};

/**
 * Mensaje legible para cualquier error, venga o no de la API. Si el servidor
 * explica qué falló (`details`), se muestra esa explicación en lugar del
 * genérico «Los datos enviados no son válidos».
 */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }
  if (error.details.length > 0) {
    return error.details.map((detail) => detail.message).join(". ");
  }
  return FRIENDLY_MESSAGES[error.code] ?? error.message;
}

/** true si el servidor respondió que el recurso no existe (404). */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * true si repetir la petición puede servir: no hubo respuesta (servidor apagado,
 * sin red) o el servidor falló (5xx). Un 4xx dice que la petición no es válida o
 * que el recurso no existe; repetirla daría la misma respuesta.
 */
export function isRetryable(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 0 || error.status >= 500)
  );
}

/** Mensaje del servidor para un campo concreto, si el error lo trae. */
export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  return error.details.find((detail) => detail.field === field)?.message;
}

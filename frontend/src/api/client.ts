/** Único lugar del frontend que conoce la dirección del backend. */
const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

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
export class ApiError extends Error {
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
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // fetch solo falla así cuando no hay respuesta: backend caído o sin red.
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "No se pudo conectar con el servidor. Comprueba que el backend esté en marcha e inténtalo de nuevo.",
    );
  }

  // 204: la operación fue correcta y no hay cuerpo que leer (p. ej. DELETE).
  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = body as Partial<ApiErrorBody> | null;
    throw new ApiError(
      response.status,
      error?.error ?? "UNKNOWN_ERROR",
      error?.message ?? "Ocurrió un error inesperado. Inténtalo de nuevo.",
      error?.details,
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

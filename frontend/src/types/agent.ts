export interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

export type AgentSort = "recent" | "oldest" | "name";

/** Filtros del listado. Sin `limit`, el backend usa su tamaño de página (6). */
export interface ListAgentsParams {
  page: number;
  limit?: number;
  search: string;
  sort: AgentSort;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedAgents {
  items: Agent[];
  meta: PaginationMeta;
}

/** Un mensaje de la conversación, en el formato que espera la API. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Cuerpo de `POST /agents/:id/run`: la consulta nueva y lo hablado antes. */
export interface RunRequest {
  query: string;
  history: ChatMessage[];
}

/** Proveedor de IA activo en el backend (`GET /api/ai/status`). */
export interface AiStatus {
  provider: string;
  /** `null` en el modo simulado. */
  model: string | null;
}

/** Resultado de ejecutar una consulta sobre un agente. */
export interface RunResult {
  agentId: string;
  response: string;
  provider: string;
}

/** Un agente: un nombre y las instrucciones que definen su comportamiento. */
export interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

/** Criterios de ordenación disponibles para el listado de agentes. */
export type AgentSort = 'recent' | 'oldest' | 'name';

/** Parámetros normalizados para consultar agentes paginados. */
export interface ListAgentsParams {
  page: number;
  limit: number;
  search: string;
  sort: AgentSort;
}

/** Metadatos de paginación devueltos por la API. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Respuesta paginada del listado de agentes. */
export interface PaginatedAgents {
  items: Agent[];
  meta: PaginationMeta;
}

/** Resultado de ejecutar una consulta sobre un agente. */
export interface RunResult {
  agentId: string;
  response: string;
  provider: string;
}

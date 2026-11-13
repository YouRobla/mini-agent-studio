export interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

export type AgentSort = "recent" | "oldest" | "name";

export interface ListAgentsParams {
  page: number;
  limit: number;
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

/** Resultado de ejecutar una consulta sobre un agente. */
export interface RunResult {
  agentId: string;
  response: string;
  provider: string;
}

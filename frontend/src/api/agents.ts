import type {
  Agent,
  ListAgentsParams,
  PaginatedAgents,
  RunRequest,
  RunResult,
} from "../types/agent.ts";
import type {
  CreateAgentInput,
  UpdateAgentInput,
} from "../schemas/agent.schemas.ts";
import { request } from "./client.ts";

/** Listado filtrado y paginado: el backend aplica página, orden y búsqueda. */
export function listAgents(params: ListAgentsParams): Promise<PaginatedAgents> {
  const query = new URLSearchParams({
    page: String(params.page),
    sort: params.sort,
  });
  if (params.search) query.set("search", params.search);
  if (params.limit) query.set("limit", String(params.limit));
  return request<PaginatedAgents>(`/agents?${query}`);
}

export function getAgent(agentId: string): Promise<Agent> {
  return request<Agent>(`/agents/${encodeURIComponent(agentId)}`);
}

export function createAgent(input: CreateAgentInput): Promise<Agent> {
  return request<Agent>("/agents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAgent(
  agentId: string,
  input: UpdateAgentInput,
): Promise<Agent> {
  return request<Agent>(`/agents/${encodeURIComponent(agentId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteAgent(agentId: string): Promise<void> {
  return request<void>(`/agents/${encodeURIComponent(agentId)}`, {
    method: "DELETE",
  });
}

export function runAgent(
  agentId: string,
  input: RunRequest,
): Promise<RunResult> {
  return request<RunResult>(`/agents/${encodeURIComponent(agentId)}/run`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

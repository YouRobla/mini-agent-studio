import type {
  Agent,
  ListAgentsParams,
  PaginatedAgents,
  RunResult,
} from "../types/agent.ts";
import type {
  CreateAgentInput,
  RunAgentInput,
} from "../schemas/agent.schemas.ts";
import { request } from "./client.ts";

export function listAgents(
  params: Partial<ListAgentsParams> = {},
): Promise<PaginatedAgents> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return request<PaginatedAgents>(`/agents${suffix}`);
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

export function runAgent(
  agentId: string,
  input: RunAgentInput,
): Promise<RunResult> {
  return request<RunResult>(`/agents/${encodeURIComponent(agentId)}/run`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

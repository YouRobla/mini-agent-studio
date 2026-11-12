import type {
  CreateAgentInput,
  RunAgentInput,
} from "../schemas/agent.schemas.ts";
import { request } from "./client.ts";

export interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

/** Resultado de ejecutar una consulta sobre un agente. */
export interface RunResult {
  agentId: string;
  response: string;
  provider: string;
}

export function listAgents(): Promise<Agent[]> {
  return request<Agent[]>("/agents");
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

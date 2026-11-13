import type { ListAgentsParams } from "../../types/agent.ts";

/**
 * Claves de caché de TanStack Query para los agentes. Al invalidar `all` o
 * `lists` se refrescan a la vez todos los listados (y el selector de Consultar).
 */
export const agentKeys = {
  all: ["agents"] as const,
  lists: ["agents", "list"] as const,
  list: (params: ListAgentsParams) => ["agents", "list", params] as const,
  detail: (id: string) => ["agents", "detail", id] as const,
};

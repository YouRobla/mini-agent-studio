import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAgent, listAgents } from "../../api/agents.ts";
import { isNotFound } from "../../api/client.ts";
import type { ListAgentsParams, PaginatedAgents } from "../../types/agent.ts";

/**
 * Claves de caché de TanStack Query para los agentes. Al invalidar `lists` se
 * refrescan a la vez todos los listados y el selector de Consultar.
 */
export const agentKeys = {
  lists: ["agents", "list"] as const,
  list: (params: ListAgentsParams) => ["agents", "list", params] as const,
  detail: (id: string) => ["agents", "detail", id] as const,
};

/** Agentes por página en el listado. */
const PAGE_SIZE = 6;

/**
 * Listado paginado, con búsqueda y orden. Mientras llega la página nueva se
 * sigue mostrando la anterior (`keepPreviousData`) para que no parpadee.
 */
export function useAgents(params: Omit<ListAgentsParams, "limit">) {
  const query: ListAgentsParams = {
    ...params,
    search: params.search.trim(),
    limit: PAGE_SIZE,
  };
  return useQuery({
    queryKey: agentKeys.list(query),
    queryFn: () => listAgents(query),
    placeholderData: keepPreviousData,
  });
}

/** Opciones del selector de Consultar: hasta 100 agentes, los más recientes primero. */
export function useAgentOptions() {
  const query: ListAgentsParams = {
    page: 1,
    limit: 100,
    search: "",
    sort: "recent",
  };
  return useQuery({
    queryKey: agentKeys.list(query),
    queryFn: () => listAgents(query),
    select: (data) => data.items,
  });
}

/**
 * Un agente por id. Si ya está en algún listado en caché se muestra al instante
 * como dato provisional (`placeholderData`), pero siempre se confirma con el
 * backend: así un agente eliminado no aparece como válido. Un 404 no se reintenta.
 */
export function useAgent(agentId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: agentKeys.detail(agentId ?? ""),
    queryFn: () => getAgent(agentId!),
    enabled: Boolean(agentId),
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
    placeholderData: () =>
      queryClient
        .getQueriesData<PaginatedAgents>({ queryKey: agentKeys.lists })
        .flatMap(([, list]) => list?.items ?? [])
        .find((agent) => agent.id === agentId),
  });
}

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAgent, listAgents } from "../../api/agents.ts";
import { ApiError } from "../../api/client.ts";
import type {
  Agent,
  ListAgentsParams,
  PaginatedAgents,
} from "../../types/agent.ts";
import { agentKeys } from "./agentKeys.ts";

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
 * Un agente por id. Si ya está en algún listado en caché, se muestra al
 * instante mientras se confirma con el backend. Un 404 no se reintenta.
 */
export function useAgent(agentId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: agentKeys.detail(agentId ?? ""),
    queryFn: () => getAgent(agentId!),
    enabled: Boolean(agentId),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
    initialData: (): Agent | undefined => {
      if (!agentId) return undefined;
      const cachedLists = queryClient.getQueriesData<PaginatedAgents>({
        queryKey: agentKeys.lists,
      });
      for (const [, data] of cachedLists) {
        const match = data?.items.find((agent) => agent.id === agentId);
        if (match) return match;
      }
      return undefined;
    },
  });
}

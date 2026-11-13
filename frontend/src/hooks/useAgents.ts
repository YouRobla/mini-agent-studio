import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import {
  createAgent,
  deleteAgent,
  getAgent,
  listAgents,
  runAgent,
  updateAgent,
} from "../api/agents.ts";
import { ApiError } from "../api/client.ts";
import type {
  RunAgentInput,
  UpdateAgentInput,
} from "../schemas/agent.schemas.ts";
import type {
  Agent,
  ListAgentsParams,
  PaginatedAgents,
} from "../types/agent.ts";

/** Claves de caché de TanStack Query para los agentes. */
const AGENTS_KEY = ["agents"] as const;
const AGENTS_LISTS_KEY = [...AGENTS_KEY, "list"] as const;
export const DEFAULT_AGENTS_LIMIT = 6;

function normalizeParams(
  params: Partial<ListAgentsParams> = {},
): ListAgentsParams {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_AGENTS_LIMIT,
    search: params.search?.trim() ?? "",
    sort: params.sort ?? "recent",
  };
}

function agentsListQueryKey(params: ListAgentsParams) {
  return [...AGENTS_LISTS_KEY, params] as const;
}

function agentDetailQueryKey(agentId: string) {
  return [...AGENTS_KEY, "detail", agentId] as const;
}

/**
 * Listado paginado de agentes con `keepPreviousData` y prefetching
 * de la página siguiente para transiciones instantáneas sin parpadeos.
 */
export function useAgents(params: Partial<ListAgentsParams> = {}) {
  const queryClient = useQueryClient();
  const normalized = normalizeParams(params);

  const query = useQuery({
    queryKey: agentsListQueryKey(normalized),
    queryFn: () => listAgents(normalized),
    placeholderData: keepPreviousData,
  });

  const prefetchPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1) return;
      const nextParams = { ...normalized, page: targetPage };
      void queryClient.prefetchQuery({
        queryKey: agentsListQueryKey(nextParams),
        queryFn: () => listAgents(nextParams),
        staleTime: 30_000,
      });
    },
    [queryClient, normalized],
  );

  useEffect(() => {
    if (query.data?.meta.hasNextPage && !query.isPlaceholderData) {
      prefetchPage(normalized.page + 1);
    }
  }, [
    query.data?.meta.hasNextPage,
    query.isPlaceholderData,
    normalized.page,
    prefetchPage,
  ]);

  return { ...query, prefetchPage };
}

/** Listado compacto para el selector de la vista de consulta. */
export function useAgentOptions() {
  const params = normalizeParams({ page: 1, limit: 100, sort: "recent" });
  return useQuery({
    queryKey: agentsListQueryKey(params),
    queryFn: () => listAgents(params),
    select: (data) => data.items,
  });
}

/** Obtiene un agente por ID reutilizando la caché de listados si ya existe. */
export function useAgent(agentId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: agentDetailQueryKey(agentId ?? ""),
    queryFn: () => getAgent(agentId!),
    enabled: Boolean(agentId),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
    initialData: (): Agent | undefined => {
      if (!agentId) return undefined;
      const cachedLists = queryClient.getQueriesData<PaginatedAgents>({
        queryKey: AGENTS_LISTS_KEY,
      });
      for (const [, data] of cachedLists) {
        const match = data?.items.find((agent) => agent.id === agentId);
        if (match) return match;
      }
      return undefined;
    },
  });
}

/** Crea un agente y refresca todas las vistas de agentes al terminar. */
export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (created) => {
      queryClient.setQueryData(agentDetailQueryKey(created.id), created);
      return queryClient.invalidateQueries({ queryKey: AGENTS_KEY });
    },
  });
}

/** Edita un agente: actualiza el detalle en caché y refresca los listados. */
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAgentInput }) =>
      updateAgent(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(agentDetailQueryKey(updated.id), updated);
      return queryClient.invalidateQueries({ queryKey: AGENTS_LISTS_KEY });
    },
  });
}

/** Elimina un agente: quita su detalle de la caché y refresca los listados. */
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: (_result, agentId) => {
      queryClient.removeQueries({ queryKey: agentDetailQueryKey(agentId) });
      return queryClient.invalidateQueries({ queryKey: AGENTS_LISTS_KEY });
    },
  });
}

/** Ejecuta una consulta sobre un agente. */
export function useRunAgent(agentId: string) {
  return useMutation({
    mutationFn: (input: RunAgentInput) => runAgent(agentId, input),
  });
}

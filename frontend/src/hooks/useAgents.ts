import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAgent,
  deleteAgent,
  getAgent,
  listAgents,
  runAgent,
  updateAgent,
} from "../api/agents.ts";
import { isNotFound } from "../api/client.ts";
import type {
  RunAgentInput,
  UpdateAgentInput,
} from "../schemas/agent.schemas.ts";
import type { ListAgentsParams } from "../types/agent.ts";

/*
 * Datos del servidor con TanStack Query. Lecturas con `useQuery` y escrituras con
 * `useMutation`. Cada componente llama al hook donde muestra los datos: la caché
 * evita peticiones repetidas y comparte el resultado, sin pasarlo por props.
 */

/**
 * Qué se pide y con qué clave se guarda en caché, juntos en un mismo sitio
 * (`queryOptions`). Las claves van de lo general a lo concreto:
 *
 *   ["agents", "list", { page, sort, search }]   un listado
 *   ["agents", "detail", id]                     un agente
 *
 * Invalidar `lists()` refresca a la vez el listado y el selector de Consultar.
 */
const agentQueries = {
  lists: () => ["agents", "list"] as const,
  list: (params: ListAgentsParams) =>
    queryOptions({
      queryKey: [...agentQueries.lists(), params] as const,
      queryFn: () => listAgents(params),
    }),
  detail: (agentId: string) =>
    queryOptions({
      queryKey: ["agents", "detail", agentId] as const,
      queryFn: () => getAgent(agentId),
    }),
};

/** Opciones del selector de Consultar: hasta 100 agentes (máximo del backend). */
const OPTIONS_PARAMS: ListAgentsParams = {
  page: 1,
  limit: 100,
  search: "",
  sort: "recent",
};

// ── Lecturas ────────────────────────────────────────────────────────────────

/**
 * Listado con página, orden y búsqueda. El backend filtra, ordena, pagina y fija
 * cuántos agentes hay por página; aquí solo se le piden. Mientras llega la página
 * nueva se sigue mostrando la anterior (`keepPreviousData`) para que no parpadee.
 */
export function useAgents(params: ListAgentsParams) {
  return useQuery({
    ...agentQueries.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Agentes del selector de Consultar; `select` se queda solo con la lista. */
export function useAgentOptions() {
  return useQuery({
    ...agentQueries.list(OPTIONS_PARAMS),
    select: (data) => data.items,
  });
}

/** Un agente por id. Sin id no se pide; un 404 (no existe) no se reintenta. */
export function useAgent(agentId: string | undefined) {
  return useQuery({
    ...agentQueries.detail(agentId ?? ""),
    enabled: Boolean(agentId),
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
  });
}

// ── Escrituras ──────────────────────────────────────────────────────────────

/** Crea un agente: guarda su detalle en caché y refresca los listados. */
export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (created) => {
      queryClient.setQueryData(
        agentQueries.detail(created.id).queryKey,
        created,
      );
      return queryClient.invalidateQueries({ queryKey: agentQueries.lists() });
    },
  });
}

/** Edita un agente: actualiza su detalle en caché y refresca los listados. */
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAgentInput }) =>
      updateAgent(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        agentQueries.detail(updated.id).queryKey,
        updated,
      );
      return queryClient.invalidateQueries({ queryKey: agentQueries.lists() });
    },
  });
}

/** Elimina un agente: quita su detalle de la caché y refresca los listados. */
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: (_result, agentId) => {
      queryClient.removeQueries({
        queryKey: agentQueries.detail(agentId).queryKey,
      });
      return queryClient.invalidateQueries({ queryKey: agentQueries.lists() });
    },
  });
}

/**
 * Ejecuta una consulta sobre un agente (`POST /agents/:id/run`). Es una mutación
 * porque se lanza a demanda, aunque no cambia ningún dato guardado.
 */
export function useRunAgent(agentId: string) {
  return useMutation({
    mutationFn: (input: RunAgentInput) => runAgent(agentId, input),
  });
}

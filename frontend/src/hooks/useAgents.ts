import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
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
 *   ["agents"]                                   todo lo de agentes
 *   ["agents", "list", { page, sort, search }]   un listado
 *   ["agents", "detail", id]                     un agente
 *
 * Invalidar `lists()` refresca a la vez el listado y el selector de Consultar;
 * invalidar `all()`, además, el agente abierto en Consultar.
 */
const agentQueries = {
  all: () => ["agents"] as const,
  lists: () => [...agentQueries.all(), "list"] as const,
  list: (params: ListAgentsParams) =>
    queryOptions({
      queryKey: [...agentQueries.lists(), params] as const,
      queryFn: () => listAgents(params),
    }),
  detail: (agentId: string) =>
    queryOptions({
      queryKey: [...agentQueries.all(), "detail", agentId] as const,
      queryFn: () => getAgent(agentId),
    }),
};

/**
 * La caché solo conoce los cambios hechos en esta pestaña. Si el agente se
 * eliminó desde otra pestaña o desde Swagger, editarlo o consultarlo responde
 * 404. En ese caso se refresca todo lo de agentes: el listado deja de mostrarlo
 * y Consultar indica que el agente no existe.
 */
function refreshIfAgentGone(queryClient: QueryClient, error: unknown) {
  if (!isNotFound(error)) return;
  return queryClient.invalidateQueries({ queryKey: agentQueries.all() });
}

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

/** Un agente por id. Sin id no se pide. */
export function useAgent(agentId: string | undefined) {
  return useQuery({
    ...agentQueries.detail(agentId ?? ""),
    enabled: Boolean(agentId),
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
    onError: (error) => refreshIfAgentGone(queryClient, error),
  });
}

/** Resultado de eliminar: `alreadyDeleted` si el agente ya no existía. */
export interface DeleteAgentResult {
  alreadyDeleted: boolean;
}

/**
 * Elimina un agente: quita su detalle de la caché y refresca los listados.
 * Un 404 significa que ya no existía (se eliminó desde otra pestaña o desde
 * Swagger). Lo que se buscaba, que el agente no exista, ya se cumple: se trata
 * como éxito y el listado se refresca igual, en lugar de un error que fallaría
 * en cada reintento.
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string): Promise<DeleteAgentResult> => {
      try {
        await deleteAgent(agentId);
        return { alreadyDeleted: false };
      } catch (error) {
        if (isNotFound(error)) return { alreadyDeleted: true };
        throw error;
      }
    },
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RunAgentInput) => runAgent(agentId, input),
    onError: (error) => refreshIfAgentGone(queryClient, error),
  });
}

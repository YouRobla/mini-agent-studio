import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAgent,
  deleteAgent,
  runAgent,
  updateAgent,
} from "../../api/agents.ts";
import type {
  RunAgentInput,
  UpdateAgentInput,
} from "../../schemas/agent.schemas.ts";
import { agentKeys } from "./agentKeys.ts";

/** Crea un agente: guarda su detalle en caché y refresca los listados. */
export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: (created) => {
      queryClient.setQueryData(agentKeys.detail(created.id), created);
      return queryClient.invalidateQueries({ queryKey: agentKeys.lists });
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
      queryClient.setQueryData(agentKeys.detail(updated.id), updated);
      return queryClient.invalidateQueries({ queryKey: agentKeys.lists });
    },
  });
}

/** Elimina un agente: quita su detalle de la caché y refresca los listados. */
export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: (_result, agentId) => {
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) });
      return queryClient.invalidateQueries({ queryKey: agentKeys.lists });
    },
  });
}

/** Ejecuta una consulta sobre un agente (no cambia ningún dato guardado). */
export function useRunAgent(agentId: string) {
  return useMutation({
    mutationFn: (input: RunAgentInput) => runAgent(agentId, input),
  });
}

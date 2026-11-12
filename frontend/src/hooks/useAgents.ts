import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAgent, listAgents } from '../api/agents.ts'

const AGENTS_KEY = ['agents'] as const

/** Listado de agentes, con sus estados de carga y error. */
export function useAgents() {
  return useQuery({ queryKey: AGENTS_KEY, queryFn: listAgents })
}

/** Crea un agente y refresca el listado al terminar. */
export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AGENTS_KEY }),
  })
}

import { createContext, useContext } from "react";
import type { Agent } from "../../types/agent.ts";

/** Acciones de escritura sobre agentes. Cada una abre su diálogo. */
export interface AgentActions {
  createAgent: () => void;
  editAgent: (agent: Agent) => void;
  deleteAgent: (agent: Agent) => void;
}

export const AgentActionsContext = createContext<AgentActions | null>(null);

/**
 * Crear, editar y eliminar agentes desde cualquier componente, sin pasar
 * funciones por props: `const { editAgent } = useAgentActions()`.
 */
export function useAgentActions(): AgentActions {
  const actions = useContext(AgentActionsContext);
  if (!actions) {
    throw new Error(
      "useAgentActions debe usarse dentro de <AgentActionsProvider>",
    );
  }
  return actions;
}

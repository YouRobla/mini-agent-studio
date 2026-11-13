import { useState, type ReactNode } from "react";
import {
  AgentActionsContext,
  type AgentActions,
} from "../../hooks/agents/useAgentActions.ts";
import type { Agent } from "../../types/agent.ts";
import { useToast } from "../ui/toast/useToast.ts";
import { AgentFormModal } from "./AgentFormModal.tsx";
import { DeleteAgentDialog } from "./DeleteAgentDialog.tsx";

/** Diálogo abierto en este momento, si hay alguno. */
type OpenDialog =
  | { type: "create" }
  | { type: "edit"; agent: Agent }
  | { type: "delete"; agent: Agent };

interface AgentActionsProviderProps {
  /** Tras crear un agente; por ejemplo, volver a la primera página del listado. */
  onCreated?: (agent: Agent) => void;
  /** Tras eliminar un agente; por ejemplo, salir de su vista de consulta. */
  onDeleted?: (agent: Agent) => void;
  children: ReactNode;
}

/**
 * Único lugar donde se crean, editan y eliminan agentes desde la interfaz.
 * Guarda qué diálogo está abierto, lo pinta y avisa del resultado con un toast.
 * Los componentes hijos solo llaman a `useAgentActions()`.
 */
export function AgentActionsProvider({
  onCreated,
  onDeleted,
  children,
}: AgentActionsProviderProps) {
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const toast = useToast();
  const close = () => setDialog(null);

  const actions: AgentActions = {
    createAgent: () => setDialog({ type: "create" }),
    editAgent: (agent) => setDialog({ type: "edit", agent }),
    deleteAgent: (agent) => setDialog({ type: "delete", agent }),
  };

  return (
    <AgentActionsContext value={actions}>
      {children}

      {dialog?.type === "create" && (
        <AgentFormModal
          onClose={close}
          onSaved={(agent) => {
            toast.success(`Agente «${agent.name}» creado correctamente.`, {
              label: "Probar agente",
              to: `/consultar/${encodeURIComponent(agent.id)}`,
            });
            onCreated?.(agent);
          }}
        />
      )}

      {dialog?.type === "edit" && (
        <AgentFormModal
          agent={dialog.agent}
          onClose={close}
          onSaved={(agent) =>
            toast.success(`Agente «${agent.name}» actualizado`)
          }
        />
      )}

      {dialog?.type === "delete" && (
        <DeleteAgentDialog
          agent={dialog.agent}
          onClose={close}
          onDeleted={(agent) => {
            close();
            toast.success(`Agente «${agent.name}» eliminado`);
            onDeleted?.(agent);
          }}
        />
      )}
    </AgentActionsContext>
  );
}

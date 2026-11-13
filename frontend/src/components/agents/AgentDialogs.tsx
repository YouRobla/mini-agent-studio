import { paths } from "../../paths.ts";
import type { Agent } from "../../types/agent.ts";
import { showSuccess } from "../ui/toast.tsx";
import { AgentFormModal } from "./AgentFormModal.tsx";
import { DeleteAgentDialog } from "./DeleteAgentDialog.tsx";

/** Diálogo de agente abierto en la página. La página lo guarda con `useState`. */
export type AgentDialog =
  | { type: "create" }
  | { type: "edit"; agent: Agent }
  | { type: "delete"; agent: Agent };

interface AgentDialogsProps {
  dialog: AgentDialog | null;
  onClose: () => void;
  /** Tras crear; por ejemplo, volver a la primera página del listado. */
  onCreated?: (agent: Agent) => void;
  /** Tras eliminar; por ejemplo, salir de la consulta del agente borrado. */
  onDeleted?: (agent: Agent) => void;
}

/**
 * Pinta el diálogo abierto (crear, editar o eliminar) y muestra un aviso con el
 * resultado. Las dos páginas lo usan igual: guardan `dialog` y lo cambian desde
 * sus botones.
 */
export function AgentDialogs({
  dialog,
  onClose,
  onCreated,
  onDeleted,
}: AgentDialogsProps) {
  if (!dialog) return null;

  if (dialog.type === "delete") {
    return (
      <DeleteAgentDialog
        agent={dialog.agent}
        onClose={onClose}
        onDeleted={(agent, alreadyDeleted) => {
          onClose();
          showSuccess(
            alreadyDeleted
              ? `El agente «${agent.name}» ya se había eliminado`
              : `Agente «${agent.name}» eliminado`,
          );
          onDeleted?.(agent);
        }}
      />
    );
  }

  if (dialog.type === "edit") {
    return (
      <AgentFormModal
        agent={dialog.agent}
        onClose={onClose}
        onSaved={(agent) => showSuccess(`Agente «${agent.name}» actualizado`)}
      />
    );
  }

  return (
    <AgentFormModal
      onClose={onClose}
      onSaved={(agent) => {
        showSuccess(`Agente «${agent.name}» creado correctamente.`, {
          label: "Probar agente",
          to: paths.consult(agent.id),
        });
        onCreated?.(agent);
      }}
    />
  );
}

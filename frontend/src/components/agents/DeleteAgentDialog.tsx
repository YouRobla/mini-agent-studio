import { errorMessage } from "../../api/client.ts";
import { useDeleteAgent } from "../../hooks/agents/useAgentMutations.ts";
import type { Agent } from "../../types/agent.ts";
import { ConfirmDialog } from "../ui/ConfirmDialog.tsx";

interface DeleteAgentDialogProps {
  agent: Agent;
  onClose: () => void;
  onDeleted: (agent: Agent) => void;
}

/** Confirma y ejecuta la eliminación de un agente. Se monta solo al pedirla. */
export function DeleteAgentDialog({
  agent,
  onClose,
  onDeleted,
}: DeleteAgentDialogProps) {
  const deleteAgent = useDeleteAgent();

  return (
    <ConfirmDialog
      title="Eliminar agente"
      message={`¿Eliminar «${agent.name}»? Esta acción no se puede deshacer.`}
      confirmLabel={deleteAgent.isPending ? "Eliminando…" : "Eliminar"}
      isPending={deleteAgent.isPending}
      error={deleteAgent.isError ? errorMessage(deleteAgent.error) : null}
      onConfirm={() =>
        deleteAgent.mutate(agent.id, { onSuccess: () => onDeleted(agent) })
      }
      onClose={onClose}
    />
  );
}

import type { Agent } from "../../types/agent.ts";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";

interface AgentQuickActionsProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/**
 * Editar y eliminar como botones de icono siempre visibles. El tooltip
 * explica el icono; eliminar solo se tiñe de rojo al pasar el ratón o al
 * enfocarlo, para no competir con la acción principal (Consultar).
 */
export function AgentQuickActions({
  agent,
  onEdit,
  onDelete,
}: AgentQuickActionsProps) {
  return (
    <div className="flex shrink-0 items-center">
      <div className="tooltip" data-tip="Editar">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          aria-label={`Editar ${agent.name}`}
          onClick={() => onEdit(agent)}
        >
          <EditIcon />
        </button>
      </div>
      <div className="tooltip" data-tip="Eliminar">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square hover:text-error focus-visible:text-error"
          aria-label={`Eliminar ${agent.name}`}
          onClick={() => onDelete(agent)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

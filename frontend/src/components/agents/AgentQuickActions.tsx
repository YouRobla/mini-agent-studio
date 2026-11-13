import type { Agent } from "../../types/agent.ts";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";

interface AgentQuickActionsProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/**
 * Editar y eliminar como botones de icono siempre visibles. El tooltip
 * explica el icono. En reposo son neutros para no competir con Consultar; al
 * pasar el ratón o enfocarlos se rellenan con su color (amarillo editar, rojo
 * eliminar). Se rellena el fondo y no solo el icono porque un icono amarillo
 * sobre fondo claro no se distingue (contraste 1.6:1).
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
          className="btn btn-ghost btn-xs btn-square hover:bg-warning hover:text-white focus-visible:bg-warning focus-visible:text-white"
          aria-label={`Editar ${agent.name}`}
          onClick={() => onEdit(agent)}
        >
          <EditIcon />
        </button>
      </div>
      <div className="tooltip" data-tip="Eliminar">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square hover:bg-error hover:text-error-content focus-visible:bg-error focus-visible:text-error-content"
          aria-label={`Eliminar ${agent.name}`}
          onClick={() => onDelete(agent)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

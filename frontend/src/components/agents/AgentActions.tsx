import type { Agent } from "../../types/agent.ts";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";

interface AgentActionsProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/*
 * Botones Editar y Eliminar de un agente, en dos variantes. Solo avisan con
 * `onEdit` / `onDelete`; qué diálogo se abre lo decide la página. En reposo son
 * neutros para no competir con «Consultar».
 */

/** Al pasar el ratón o con foco, eliminar se rellena de rojo. */
const DELETE_HOVER =
  "hover:bg-error hover:text-error-content focus-visible:bg-error focus-visible:text-error-content";

/** Iconos con tooltip, para tarjetas y filas del listado. */
export function AgentIconActions({
  agent,
  onEdit,
  onDelete,
}: AgentActionsProps) {
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
          className={`btn btn-ghost btn-xs btn-square ${DELETE_HOVER}`}
          aria-label={`Eliminar ${agent.name}`}
          onClick={() => onDelete(agent)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/** Botones con texto, para la vista Consultar. */
export function AgentLabelActions({
  agent,
  onEdit,
  onDelete,
}: AgentActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="btn btn-sm flex-1 hover:bg-warning hover:text-warning-content focus-visible:bg-warning focus-visible:text-warning-content sm:flex-none"
        onClick={() => onEdit(agent)}
      >
        <EditIcon />
        Editar
      </button>
      <button
        type="button"
        className={`btn btn-sm btn-ghost flex-1 sm:flex-none ${DELETE_HOVER}`}
        onClick={() => onDelete(agent)}
      >
        <TrashIcon />
        Eliminar
      </button>
    </div>
  );
}

import type { Agent } from "../../types/agent.ts";
import { formatAgentDate } from "../agents/formatAgentDate.ts";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";

interface AgentDetailsProps {
  agent: Agent;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Instrucciones y acciones del agente elegido, dentro del panel de Consultar.
 * El nombre no se repite aquí: ya lo muestra el selector de arriba.
 */
export function AgentDetails({ agent, onEdit, onDelete }: AgentDetailsProps) {
  return (
    <div className="space-y-3 border-t border-base-300 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Instrucciones</h2>
        <span className="badge badge-ghost badge-sm">
          {agent.instructions.length} car.
        </span>
      </div>
      <p className="max-h-[40dvh] overflow-y-auto rounded-box bg-base-200 p-3 text-sm leading-relaxed whitespace-pre-wrap text-base-content/80 [overflow-wrap:anywhere]">
        {agent.instructions}
      </p>
      <p className="text-xs text-base-content/60">
        Creado el {formatAgentDate(agent.createdAt)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-sm flex-1 hover:bg-warning hover:text-warning-content focus-visible:bg-warning focus-visible:text-warning-content"
          onClick={onEdit}
        >
          <EditIcon />
          Editar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-ghost flex-1 hover:bg-error hover:text-error-content focus-visible:bg-error focus-visible:text-error-content"
          onClick={onDelete}
        >
          <TrashIcon />
          Eliminar
        </button>
      </div>
    </div>
  );
}

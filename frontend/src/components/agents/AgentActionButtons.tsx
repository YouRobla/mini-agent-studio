import { useAgentActions } from "../../hooks/agents/useAgentActions.ts";
import type { Agent } from "../../types/agent.ts";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";

/**
 * Botones que disparan las acciones de agente. En reposo son neutros para no
 * competir con «Consultar»; al pasar el ratón o con foco, editar se rellena de
 * amarillo y eliminar de rojo.
 */
const DELETE_HOVER =
  "hover:bg-error hover:text-error-content focus-visible:bg-error focus-visible:text-error-content";

/** Botón principal de la vista Agentes: abre el formulario de creación. */
export function NewAgentButton() {
  const { createAgent } = useAgentActions();

  return (
    <button
      type="button"
      className="btn btn-primary shrink-0"
      onClick={createAgent}
    >
      <span aria-hidden="true">+</span> Nuevo agente
    </button>
  );
}

/** Editar y eliminar como iconos con tooltip, para tarjetas y filas del listado. */
export function AgentQuickActions({ agent }: { agent: Agent }) {
  const { editAgent, deleteAgent } = useAgentActions();

  return (
    <div className="flex shrink-0 items-center">
      <div className="tooltip" data-tip="Editar">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square hover:bg-warning hover:text-white focus-visible:bg-warning focus-visible:text-white"
          aria-label={`Editar ${agent.name}`}
          onClick={() => editAgent(agent)}
        >
          <EditIcon />
        </button>
      </div>
      <div className="tooltip" data-tip="Eliminar">
        <button
          type="button"
          className={`btn btn-ghost btn-xs btn-square ${DELETE_HOVER}`}
          aria-label={`Eliminar ${agent.name}`}
          onClick={() => deleteAgent(agent)}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/** Editar y eliminar con texto, para el encabezado de la vista Consultar. */
export function AgentPanelActions({ agent }: { agent: Agent }) {
  const { editAgent, deleteAgent } = useAgentActions();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="btn btn-sm flex-1 hover:bg-warning hover:text-warning-content focus-visible:bg-warning focus-visible:text-warning-content sm:flex-none"
        onClick={() => editAgent(agent)}
      >
        <EditIcon />
        Editar
      </button>
      <button
        type="button"
        className={`btn btn-sm btn-ghost flex-1 sm:flex-none ${DELETE_HOVER}`}
        onClick={() => deleteAgent(agent)}
      >
        <TrashIcon />
        Eliminar
      </button>
    </div>
  );
}

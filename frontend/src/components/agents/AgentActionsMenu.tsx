import { useId, type CSSProperties } from "react";
import type { Agent } from "../../types/agent.ts";

interface AgentActionsMenuProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/**
 * Menú «⋯» con Editar y Eliminar. Usa el dropdown de daisyUI con la API
 * Popover: el navegador gestiona Escape, clic fuera y el foco.
 */
export function AgentActionsMenu({
  agent,
  onEdit,
  onDelete,
}: AgentActionsMenuProps) {
  // useId devuelve «:r1:»; se limpia para que sirva como nombre de ancla CSS.
  const menuId = `agent-menu-${useId().replace(/:/g, "")}`;
  const anchor = `--${menuId}`;

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square"
        popoverTarget={menuId}
        style={{ anchorName: anchor } as CSSProperties}
        aria-label={`Acciones de ${agent.name}`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          ⋯
        </span>
      </button>
      <ul
        id={menuId}
        popover="auto"
        className="dropdown dropdown-end menu w-40 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
        style={{ positionAnchor: anchor } as CSSProperties}
      >
        <li>
          <button
            type="button"
            popoverTarget={menuId}
            popoverTargetAction="hide"
            onClick={() => onEdit(agent)}
          >
            Editar
          </button>
        </li>
        <li>
          <button
            type="button"
            className="text-error"
            popoverTarget={menuId}
            popoverTargetAction="hide"
            onClick={() => onDelete(agent)}
          >
            Eliminar
          </button>
        </li>
      </ul>
    </>
  );
}

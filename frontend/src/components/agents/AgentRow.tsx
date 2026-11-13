import type { Agent } from "../../types/agent.ts";
import { AgentAvatar } from "./AgentAvatar.tsx";
import { AgentQuickActions } from "./AgentQuickActions.tsx";
import { ConsultAgentLink } from "./ConsultAgentLink.tsx";
import { formatAgentDate } from "./formatAgentDate.ts";

interface AgentRowProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/**
 * Agente en la vista de lista: una fila de la `table` de daisyUI. En pantallas
 * pequeñas se ocultan las columnas de instrucciones y fecha.
 */
export function AgentRow({ agent, onEdit, onDelete }: AgentRowProps) {
  return (
    <tr className="hover:bg-base-200">
      <td>
        <div className="flex items-center gap-3">
          <AgentAvatar name={agent.name} />
          <span className="font-semibold break-words">
            {agent.name}
          </span>
        </div>
      </td>
      <td className="hidden max-w-md md:table-cell">
        <span
          className="line-clamp-1 text-base-content/70"
          title={agent.instructions}
        >
          {agent.instructions}
        </span>
      </td>
      <td className="hidden whitespace-nowrap text-base-content/60 sm:table-cell">
        {formatAgentDate(agent.createdAt)}
      </td>
      <td>
        <div className="flex items-center justify-end gap-1">
          <ConsultAgentLink agent={agent} />
          <AgentQuickActions
            agent={agent}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

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
 * Agente en la vista de lista: nombre e instrucciones a la izquierda (lo que
 * se lee primero), fecha discreta y acciones al final de la fila.
 */
export function AgentRow({ agent, onEdit, onDelete }: AgentRowProps) {
  return (
    <li className="list-row items-center gap-3 px-1 py-3">
      <AgentAvatar name={agent.name} />
      <div className="list-col-grow min-w-0">
        <p className="truncate text-sm font-semibold" title={agent.name}>
          {agent.name}
        </p>
        <p
          className="truncate text-sm text-base-content/70"
          title={agent.instructions}
        >
          {agent.instructions}
        </p>
      </div>
      <span className="hidden shrink-0 text-xs text-base-content/60 sm:inline">
        {formatAgentDate(agent.createdAt)}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <ConsultAgentLink agent={agent} />
        <AgentQuickActions agent={agent} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}

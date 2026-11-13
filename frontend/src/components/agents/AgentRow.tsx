import type { Agent } from "../../types/agent.ts";
import { AgentAvatar } from "./AgentAvatar.tsx";
import { ConsultAgentLink } from "./ConsultAgentLink.tsx";
import { formatAgentDate } from "./formatAgentDate.ts";

interface AgentRowProps {
  agent: Agent;
  onInspect: (agent: Agent) => void;
}

/** Agente en la vista de lista compacta. */
export function AgentRow({ agent, onInspect }: AgentRowProps) {
  return (
    <li className="list-row items-center gap-3 px-1 py-2.5">
      <AgentAvatar name={agent.name} />
      <div className="list-col-grow min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{agent.name}</p>
          <span className="hidden text-xs text-base-content/55 sm:inline">
            · {formatAgentDate(agent.createdAt)}
          </span>
        </div>
        <p className="truncate text-xs text-base-content/70">
          {agent.instructions}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onInspect(agent)}
          aria-label={`Ver instrucciones de ${agent.name}`}
        >
          Detalles
        </button>
        <ConsultAgentLink agent={agent} />
      </div>
    </li>
  );
}

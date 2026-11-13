import type { Agent } from "../../types/agent.ts";
import { formatShortDate } from "../../utils/formatDate.ts";
import { AgentAvatar } from "./AgentAvatar.tsx";
import { AgentIconActions } from "./AgentActions.tsx";
import { ConsultAgentLink } from "./ConsultAgentLink.tsx";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <article className="card card-border bg-base-100 transition-colors hover:border-base-content/30">
      <div className="card-body gap-3 p-4">
        <div className="flex items-start gap-3">
          <AgentAvatar name={agent.name} />
          <div className="min-w-0 flex-1">
            <h3 className="card-title truncate text-base" title={agent.name}>
              {agent.name}
            </h3>
            <p className="text-xs text-base-content/60">
              {formatShortDate(agent.createdAt)}
            </p>
          </div>
          <AgentIconActions
            agent={agent}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <p
          className="line-clamp-2 min-h-10 text-sm text-base-content/75 [overflow-wrap:anywhere]"
          title={agent.instructions}
        >
          {agent.instructions}
        </p>

        <div className="card-actions items-center justify-between">
          <span className="badge badge-ghost badge-sm">
            {agent.instructions.length} car.
          </span>
          <ConsultAgentLink agent={agent} />
        </div>
      </div>
    </article>
  );
}

import type { Agent } from "../../types/agent.ts";
import { AgentActionsMenu } from "./AgentActionsMenu.tsx";
import { AgentAvatar } from "./AgentAvatar.tsx";
import { ConsultAgentLink } from "./ConsultAgentLink.tsx";
import { formatAgentDate } from "./formatAgentDate.ts";

interface AgentCardProps {
  agent: Agent;
  onInspect: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/** Agente en la vista de tarjetas. */
export function AgentCard({
  agent,
  onInspect,
  onEdit,
  onDelete,
}: AgentCardProps) {
  return (
    <article className="card card-border bg-base-100 transition-colors hover:border-base-content/30">
      <div className="card-body gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <AgentAvatar name={agent.name} />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold" title={agent.name}>
                {agent.name}
              </h3>
              <p className="text-xs text-base-content/60">
                {formatAgentDate(agent.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <div className="tooltip tooltip-left" data-tip="Ver instrucciones">
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={`Ver instrucciones de ${agent.name}`}
                onClick={() => onInspect(agent)}
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </div>
            <AgentActionsMenu
              agent={agent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-base-content/75 [overflow-wrap:anywhere]">
          {agent.instructions}
        </p>

        <div className="card-actions mt-auto items-center justify-between border-t border-base-300/70 pt-2.5">
          <span className="badge badge-ghost badge-xs">
            {agent.instructions.length} car.
          </span>
          <ConsultAgentLink agent={agent} />
        </div>
      </div>
    </article>
  );
}

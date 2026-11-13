import { Link } from "react-router";
import type { Agent } from "../../types/agent.ts";
import { AgentAvatar } from "../agents/AgentAvatar.tsx";
import { formatAgentDate } from "../agents/formatAgentDate.ts";

interface AgentDetailsProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentDetails({ agent, onEdit, onDelete }: AgentDetailsProps) {
  return (
    <section
      className="card card-border min-w-0 bg-base-100"
      aria-labelledby="selected-agent-title"
    >
      <div className="card-body gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AgentAvatar name={agent.name} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Agente seleccionado
            </p>
            <h2
              id="selected-agent-title"
              className="card-title text-lg [overflow-wrap:anywhere]"
            >
              {agent.name}
            </h2>
            <p className="mt-0.5 text-xs text-base-content/60">
              Creado el {formatAgentDate(agent.createdAt)}
            </p>
          </div>
        </div>

        <div className="border-t border-base-300 pt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Instrucciones</h3>
            <span className="badge badge-outline badge-xs">
              {agent.instructions.length} car.
            </span>
          </div>
          <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-base-content/80 [overflow-wrap:anywhere]">
            {agent.instructions}
          </p>
        </div>

        <div className="flex gap-2 border-t border-base-300 pt-3">
          <button
            type="button"
            className="btn btn-sm flex-1"
            onClick={() => onEdit(agent)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-error btn-outline flex-1"
            onClick={() => onDelete(agent)}
          >
            Eliminar
          </button>
        </div>

        <div className="border-t border-base-300 pt-3">
          <Link
            to="/"
            className="btn btn-ghost btn-sm w-full justify-start px-2"
          >
            ← Volver al listado de agentes
          </Link>
        </div>
      </div>
    </section>
  );
}

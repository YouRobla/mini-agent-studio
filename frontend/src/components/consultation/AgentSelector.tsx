import { Link } from "react-router";
import { errorMessage } from "../../api/client.ts";
import type { useAgentOptions } from "../../hooks/useAgents.ts";
import { AgentsSkeleton } from "../agents/AgentsSkeleton.tsx";

interface AgentSelectorProps {
  agents: ReturnType<typeof useAgentOptions>;
  agentId: string | undefined;
  agentNotFound: boolean;
  onSelect: (agentId: string) => void;
}

export function AgentSelector({
  agents,
  agentId,
  agentNotFound,
  onSelect,
}: AgentSelectorProps) {
  const list = agents.data ?? [];
  const hasSelectedInOptions = list.some((agent) => agent.id === agentId);

  return (
    <fieldset className="fieldset min-w-0 p-0">
      <label className="fieldset-legend pt-0" htmlFor="agent-selector">
        Agente para esta consulta
      </label>
      {agents.isPending && <AgentsSkeleton selector />}
      {agents.isError && (
        <div
          role="alert"
          className="alert alert-error alert-vertical sm:alert-horizontal"
        >
          <span className="flex-1">{errorMessage(agents.error)}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => agents.refetch()}
            disabled={agents.isFetching}
          >
            {agents.isFetching ? "Reintentando…" : "Reintentar"}
          </button>
        </div>
      )}
      {agents.isSuccess && (
        <>
          <select
            id="agent-selector"
            className="select w-full"
            disabled={list.length === 0}
            value={hasSelectedInOptions && agentId ? agentId : ""}
            onChange={(event) => onSelect(event.target.value)}
          >
            <option value="" disabled>
              Selecciona un agente
            </option>
            {list.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {agentId && agentNotFound && (
            <div role="alert" className="alert alert-warning mt-2">
              El agente no existe. Elige otro agente en el selector.
            </div>
          )}
          {list.length === 0 && (
            <p className="mt-1.5 text-sm text-base-content/70">
              Todavía no hay agentes disponibles.{" "}
              <Link to="/" className="link">
                Crea tu primer agente
              </Link>{" "}
              para empezar.
            </p>
          )}
        </>
      )}
    </fieldset>
  );
}

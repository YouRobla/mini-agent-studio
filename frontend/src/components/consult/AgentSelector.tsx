import { Link } from "react-router";
import { errorMessage } from "../../api/client.ts";
import { useAgentOptions, useRetryAll } from "../../hooks/useAgents.ts";
import { paths } from "../../paths.ts";
import { ErrorAlert } from "../ui/ErrorAlert.tsx";

interface AgentSelectorProps {
  agentId: string | undefined;
  /** El id de la URL no corresponde a ningún agente. */
  notFound: boolean;
  onSelect: (agentId: string) => void;
}

/** Selector del agente a consultar, con sus estados de carga, error y lista vacía. */
export function AgentSelector({
  agentId,
  notFound,
  onSelect,
}: AgentSelectorProps) {
  const agents = useAgentOptions();
  const retryAll = useRetryAll();
  const options = agents.data ?? [];
  const isListed = options.some((agent) => agent.id === agentId);

  return (
    <fieldset className="fieldset min-w-0 p-0">
      <label className="fieldset-legend pt-0" htmlFor="agent-selector">
        Agente para esta consulta
      </label>

      {agents.isPending && (
        <div
          className="skeleton h-10 w-full"
          role="status"
          aria-label="Cargando agentes"
        />
      )}

      {agents.isError && (
        <ErrorAlert
          title="No se pudieron cargar los agentes"
          message={errorMessage(agents.error)}
          onRetry={() => retryAll()}
          retrying={agents.isFetching}
        />
      )}

      {agents.isSuccess && (
        <>
          <select
            id="agent-selector"
            className="select w-full sm:max-w-sm"
            disabled={options.length === 0}
            value={isListed && agentId ? agentId : ""}
            onChange={(event) => onSelect(event.target.value)}
          >
            <option value="" disabled>
              Selecciona un agente
            </option>
            {options.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {notFound && (
            <div role="alert" className="alert alert-warning mt-2">
              El agente no existe. Elige otro agente en el selector.
            </div>
          )}
          {options.length === 0 && (
            <p className="mt-1.5 text-sm text-base-content/70">
              Todavía no hay agentes disponibles.{" "}
              <Link to={paths.agents} className="link">
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

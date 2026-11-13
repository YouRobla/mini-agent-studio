import { useNavigate } from "react-router";
import { errorMessage, isNotFound } from "../../api/client.ts";
import { useAgent } from "../../hooks/agents/useAgentQueries.ts";
import { formatShortDate } from "../../utils/formatDate.ts";
import { AgentPanelActions } from "../agents/AgentActionButtons.tsx";
import { ErrorAlert } from "../ui/ErrorAlert.tsx";
import { AgentSelector } from "./AgentSelector.tsx";

/**
 * Encabezado de contexto de Consultar: qué agente se está probando, sus
 * acciones y sus instrucciones (lo que un modelo real recibiría como mensaje
 * de sistema), en un `collapse` que se puede plegar para dar sitio al chat.
 */
export function AgentPanel({ agentId }: { agentId: string | undefined }) {
  const navigate = useNavigate();
  const {
    data: agent,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useAgent(agentId);
  const notFound = isError && isNotFound(error);

  return (
    <section
      className="card card-border min-w-0 bg-base-100"
      aria-label="Agente seleccionado"
    >
      <div className="card-body gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <AgentSelector
              agentId={agentId}
              notFound={notFound}
              onSelect={(id) =>
                navigate(`/consultar/${encodeURIComponent(id)}`)
              }
            />
          </div>
          {agent && <AgentPanelActions agent={agent} />}
        </div>

        {agentId && isPending && (
          <div className="space-y-2" role="status" aria-label="Cargando agente">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-4 w-full" />
          </div>
        )}

        {isError && !notFound && (
          <ErrorAlert
            message={errorMessage(error)}
            onRetry={() => refetch()}
            retrying={isFetching}
          />
        )}

        {agent && (
          <details
            className="collapse collapse-arrow border border-base-300 bg-base-200"
            open
          >
            <summary className="collapse-title text-sm font-semibold">
              Instrucciones
              <span className="ml-2 font-normal text-base-content/60">
                {agent.instructions.length} caracteres · Creado el{" "}
                {formatShortDate(agent.createdAt)}
              </span>
            </summary>
            <div className="collapse-content">
              <p className="max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-base-content/80 [overflow-wrap:anywhere]">
                {agent.instructions}
              </p>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

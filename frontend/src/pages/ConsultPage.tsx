import { useNavigate, useParams } from "react-router";
import { ApiError, errorMessage } from "../api/client.ts";
import { AgentSelector } from "../components/consultation/AgentSelector.tsx";
import { QueryPanel } from "../components/consultation/QueryPanel.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgent, useAgentOptions } from "../hooks/useAgents.ts";

export function ConsultPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agentOptions = useAgentOptions();
  const selectedAgentQuery = useAgent(agentId);

  const isAgentNotFound =
    selectedAgentQuery.isError &&
    selectedAgentQuery.error instanceof ApiError &&
    selectedAgentQuery.error.status === 404;

  const hasDetailError = selectedAgentQuery.isError && !isAgentNotFound;
  const selectedAgent = agentId ? selectedAgentQuery.data : undefined;

  return (
    <div className="space-y-4">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <PageHeader
          eyebrow="Prueba tus agentes"
          title="Consultar"
          description="Revisa las instrucciones del agente y pruébalo en el chat."
        />
        <AgentSelector
          agents={agentOptions}
          agentId={agentId}
          agentNotFound={isAgentNotFound}
          onSelect={(id) => navigate(`/consultar/${encodeURIComponent(id)}`)}
        />
      </div>

      {agentId && selectedAgentQuery.isPending && (
        <div
          className="grid items-start gap-5 md:grid-cols-[minmax(14rem,0.75fr)_minmax(0,1.5fr)]"
          role="status"
          aria-label="Cargando agente seleccionado"
        >
          <div className="card card-border bg-base-100 p-5">
            <div className="skeleton mb-3 h-4 w-28" />
            <div className="skeleton mb-5 h-6 w-44" />
            <div className="skeleton h-28 w-full" />
          </div>
          <div className="card card-border bg-base-100 p-5">
            <div className="skeleton mb-4 h-6 w-48" />
            <div className="skeleton h-52 w-full" />
          </div>
        </div>
      )}

      {hasDetailError && (
        <div
          role="alert"
          className="alert alert-error alert-vertical sm:alert-horizontal"
        >
          <span className="flex-1">{errorMessage(selectedAgentQuery.error)}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => selectedAgentQuery.refetch()}
            disabled={selectedAgentQuery.isFetching}
          >
            {selectedAgentQuery.isFetching ? "Reintentando…" : "Reintentar"}
          </button>
        </div>
      )}

      {(!agentId || isAgentNotFound || selectedAgentQuery.isSuccess) && (
        <QueryPanel
          key={selectedAgent?.id ?? "none"}
          agent={selectedAgent}
        />
      )}
    </div>
  );
}

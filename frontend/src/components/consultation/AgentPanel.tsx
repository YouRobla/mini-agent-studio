import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, errorMessage } from "../../api/client.ts";
import type { useAgent, useAgentOptions } from "../../hooks/useAgents.ts";
import { AgentFormModal } from "../agents/AgentFormModal.tsx";
import { DeleteAgentDialog } from "../agents/DeleteAgentDialog.tsx";
import { useToast } from "../ui/toast/useToast.ts";
import { AgentDetails } from "./AgentDetails.tsx";
import { AgentSelector } from "./AgentSelector.tsx";

interface AgentPanelProps {
  agentId: string | undefined;
  agentOptions: ReturnType<typeof useAgentOptions>;
  agentQuery: ReturnType<typeof useAgent>;
}

/**
 * Columna izquierda de Consultar: todo lo que tiene que ver con el agente
 * (elegirlo, leer sus instrucciones, editarlo o eliminarlo) en un solo lugar.
 */
export function AgentPanel({
  agentId,
  agentOptions,
  agentQuery,
}: AgentPanelProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isNotFound =
    agentQuery.isError &&
    agentQuery.error instanceof ApiError &&
    agentQuery.error.status === 404;
  const hasLoadError = agentQuery.isError && !isNotFound;
  const agent = agentId && agentQuery.isSuccess ? agentQuery.data : undefined;

  return (
    <section
      className="card card-border min-w-0 bg-base-100"
      aria-label="Agente"
    >
      <div className="card-body gap-4 p-4 sm:p-5">
        <AgentSelector
          agents={agentOptions}
          agentId={agentId}
          agentNotFound={isNotFound}
          onSelect={(id) => navigate(`/consultar/${encodeURIComponent(id)}`)}
        />

        {!agentId && (
          <p className="text-sm text-base-content/70">
            Al elegir un agente verás aquí sus instrucciones.
          </p>
        )}

        {agentId && agentQuery.isPending && (
          <div
            className="space-y-3 border-t border-base-300 pt-4"
            role="status"
            aria-label="Cargando agente"
          >
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-8 w-full" />
          </div>
        )}

        {hasLoadError && (
          <div role="alert" className="alert alert-error alert-vertical">
            <span>{errorMessage(agentQuery.error)}</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => agentQuery.refetch()}
              disabled={agentQuery.isFetching}
            >
              {agentQuery.isFetching ? "Reintentando…" : "Reintentar"}
            </button>
          </div>
        )}

        {agent && (
          <AgentDetails
            agent={agent}
            onEdit={() => setEditing(true)}
            onDelete={() => setDeleting(true)}
          />
        )}
      </div>

      {editing && agent && (
        <AgentFormModal
          agent={agent}
          onClose={() => setEditing(false)}
          onSaved={(saved) =>
            toast.success(`Agente «${saved.name}» actualizado`)
          }
        />
      )}

      {deleting && agent && (
        <DeleteAgentDialog
          agent={agent}
          onClose={() => setDeleting(false)}
          onDeleted={(deleted) => {
            setDeleting(false);
            toast.success(`Agente «${deleted.name}» eliminado`);
            navigate("/consultar");
          }}
        />
      )}
    </section>
  );
}

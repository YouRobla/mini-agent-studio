import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, errorMessage } from "../../api/client.ts";
import type { useAgent, useAgentOptions } from "../../hooks/useAgents.ts";
import { AgentFormModal } from "../agents/AgentFormModal.tsx";
import { DeleteAgentDialog } from "../agents/DeleteAgentDialog.tsx";
import { EditIcon, TrashIcon } from "../ui/icons.tsx";
import { useToast } from "../ui/toast/useToast.ts";
import { AgentDetails } from "./AgentDetails.tsx";
import { AgentSelector } from "./AgentSelector.tsx";

interface AgentPanelProps {
  agentId: string | undefined;
  agentOptions: ReturnType<typeof useAgentOptions>;
  agentQuery: ReturnType<typeof useAgent>;
}

/**
 * Encabezado de contexto de Consultar: qué agente se está probando, con qué
 * instrucciones, y las acciones para editarlo o eliminarlo. Debajo va el chat.
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
      aria-label="Agente seleccionado"
    >
      <div className="card-body gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <AgentSelector
              agents={agentOptions}
              agentId={agentId}
              agentNotFound={isNotFound}
              onSelect={(id) =>
                navigate(`/consultar/${encodeURIComponent(id)}`)
              }
            />
          </div>
          {agent && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-sm flex-1 hover:bg-warning hover:text-warning-content focus-visible:bg-warning focus-visible:text-warning-content sm:flex-none"
                onClick={() => setEditing(true)}
              >
                <EditIcon />
                Editar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost flex-1 hover:bg-error hover:text-error-content focus-visible:bg-error focus-visible:text-error-content sm:flex-none"
                onClick={() => setDeleting(true)}
              >
                <TrashIcon />
                Eliminar
              </button>
            </div>
          )}
        </div>

        {agentId && agentQuery.isPending && (
          <div
            className="space-y-2 border-t border-base-300 pt-4"
            role="status"
            aria-label="Cargando agente"
          >
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        )}

        {hasLoadError && (
          <div
            role="alert"
            className="alert alert-error alert-vertical sm:alert-horizontal"
          >
            <span className="flex-1">{errorMessage(agentQuery.error)}</span>
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

        {agent && <AgentDetails agent={agent} />}
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

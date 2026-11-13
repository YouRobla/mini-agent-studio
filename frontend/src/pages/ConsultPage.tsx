import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { errorMessage, isNotFound } from "../api/client.ts";
import { AgentLabelActions } from "../components/agents/AgentActions.tsx";
import {
  AgentDialogs,
  type AgentDialog,
} from "../components/agents/AgentDialogs.tsx";
import { AgentInstructions } from "../components/consult/AgentInstructions.tsx";
import { AgentSelector } from "../components/consult/AgentSelector.tsx";
import {
  ConsultBox,
  ConsultBoxPlaceholder,
} from "../components/consult/ConsultBox.tsx";
import { ErrorAlert } from "../components/ui/ErrorAlert.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgent } from "../hooks/useAgents.ts";
import { paths } from "../paths.ts";

/**
 * Vista Consultar. Arriba, el agente elegido: selector, editar/eliminar e
 * instrucciones. Debajo, la caja de consulta. El agente vive en la URL
 * (`/consultar/:agentId`); al eliminarlo se vuelve a `/consultar`. La `key`
 * reinicia la consulta al cambiar de agente.
 */
export function ConsultPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<AgentDialog | null>(null);
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
    <div className="space-y-4">
      <PageHeader
        eyebrow="Prueba tus agentes"
        title="Consultar"
        description="Elige un agente, revisa sus instrucciones y pruébalo en el chat."
      />

      <section
        className="card card-border min-w-0 bg-base-100"
        aria-label="Agente seleccionado"
      >
        <div className="card-body gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <AgentSelector
                agentId={agentId}
                notFound={notFound}
                onSelect={(id) => navigate(paths.consult(id))}
              />
            </div>
            {agent && (
              <AgentLabelActions
                agent={agent}
                onEdit={(agent) => setDialog({ type: "edit", agent })}
                onDelete={(agent) => setDialog({ type: "delete", agent })}
              />
            )}
          </div>

          {agentId && isPending && (
            <div className="space-y-2" role="status" aria-label="Cargando agente">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-full" />
            </div>
          )}

          {isError && !notFound && (
            <ErrorAlert
              title="No se pudo cargar el agente"
              message={errorMessage(error)}
              onRetry={() => refetch()}
              retrying={isFetching}
            />
          )}

          {agent && <AgentInstructions agent={agent} />}
        </div>
      </section>

      {agent ? (
        <ConsultBox key={agent.id} agent={agent} />
      ) : (
        <ConsultBoxPlaceholder />
      )}

      <AgentDialogs
        dialog={dialog}
        onClose={() => setDialog(null)}
        onDeleted={() => navigate(paths.consult())}
      />
    </div>
  );
}

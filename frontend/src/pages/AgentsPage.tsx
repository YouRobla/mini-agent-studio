import { useState } from "react";
import {
  AgentDialogs,
  type AgentDialog,
} from "../components/agents/AgentDialogs.tsx";
import { AgentList } from "../components/agents/AgentList.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgentsListParams } from "../hooks/useAgentsListParams.ts";

/**
 * Vista Agentes: crear, listar, editar y eliminar. La página guarda qué diálogo
 * está abierto y lo cambia desde sus botones y los del listado. Al crear un
 * agente se vuelve a la primera página sin filtros, donde aparece por ser el más
 * reciente.
 */
export function AgentsPage() {
  const [dialog, setDialog] = useState<AgentDialog | null>(null);
  const { resetFilters } = useAgentsListParams();

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Tu espacio de trabajo"
          title="Agentes"
          description="Organiza tus asistentes, busca por rol y pon sus instrucciones a prueba."
        />
        <button
          type="button"
          className="btn btn-primary shrink-0"
          onClick={() => setDialog({ type: "create" })}
        >
          <span aria-hidden="true">+</span> Nuevo agente
        </button>
      </div>

      <AgentList
        onCreate={() => setDialog({ type: "create" })}
        onEdit={(agent) => setDialog({ type: "edit", agent })}
        onDelete={(agent) => setDialog({ type: "delete", agent })}
      />

      <AgentDialogs
        dialog={dialog}
        onClose={() => setDialog(null)}
        onCreated={resetFilters}
      />
    </div>
  );
}

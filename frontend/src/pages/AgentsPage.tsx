import { useState } from "react";
import { AgentFormModal } from "../components/agents/AgentFormModal.tsx";
import { AgentList } from "../components/agents/AgentList.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useToast } from "../components/ui/toast/useToast.ts";
import { useAgentsListParams } from "../hooks/agents/useAgentsListParams.ts";

/**
 * Vista Agentes: encabezado, listado y modal para crear. El estado del listado
 * (página, orden y búsqueda) lo gestiona `useAgentsListParams` en la URL.
 */
export function AgentsPage() {
  const [creating, setCreating] = useState(false);
  const { resetFilters } = useAgentsListParams();
  const toast = useToast();

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
          onClick={() => setCreating(true)}
        >
          <span aria-hidden="true">+</span> Nuevo agente
        </button>
      </div>

      <AgentList onRequestCreate={() => setCreating(true)} />

      {creating && (
        <AgentFormModal
          onClose={() => setCreating(false)}
          onSaved={(agent) => {
            toast.success(`Agente «${agent.name}» creado correctamente.`, {
              label: "Probar agente",
              to: `/consultar/${encodeURIComponent(agent.id)}`,
            });
            // El agente nuevo es el más reciente: volver a la primera página sin filtros.
            resetFilters();
          }}
        />
      )}
    </div>
  );
}

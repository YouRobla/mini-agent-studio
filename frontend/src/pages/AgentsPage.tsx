import { NewAgentButton } from "../components/agents/AgentActionButtons.tsx";
import { AgentActionsProvider } from "../components/agents/AgentActionsProvider.tsx";
import { AgentList } from "../components/agents/AgentList.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgentsListParams } from "../hooks/agents/useAgentsListParams.ts";

/**
 * Vista Agentes: crear, listar, editar y eliminar. Al crear un agente se vuelve
 * a la primera página sin filtros, donde aparece por ser el más reciente.
 */
export function AgentsPage() {
  const { resetFilters } = useAgentsListParams();

  return (
    <AgentActionsProvider onCreated={resetFilters}>
      <div className="space-y-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            eyebrow="Tu espacio de trabajo"
            title="Agentes"
            description="Organiza tus asistentes, busca por rol y pon sus instrucciones a prueba."
          />
          <NewAgentButton />
        </div>
        <AgentList />
      </div>
    </AgentActionsProvider>
  );
}

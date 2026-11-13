import { useParams } from "react-router";
import { AgentPanel } from "../components/consultation/AgentPanel.tsx";
import { QueryPanel } from "../components/consultation/QueryPanel.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgent, useAgentOptions } from "../hooks/useAgents.ts";

/**
 * Vista Consultar: arriba el contexto del agente (selector, instrucciones y
 * acciones) y debajo el chat a todo el ancho. El agente elegido vive en la URL.
 */
export function ConsultPage() {
  const { agentId } = useParams();
  const agentOptions = useAgentOptions();
  const agentQuery = useAgent(agentId);
  const agent = agentId && agentQuery.isSuccess ? agentQuery.data : undefined;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Prueba tus agentes"
        title="Consultar"
        description="Elige un agente, revisa sus instrucciones y pruébalo en el chat."
      />
      <div className="space-y-4">
        <AgentPanel
          agentId={agentId}
          agentOptions={agentOptions}
          agentQuery={agentQuery}
        />
        <QueryPanel agent={agent} />
      </div>
    </div>
  );
}

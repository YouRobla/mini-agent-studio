import { useNavigate, useParams } from "react-router";
import { AgentActionsProvider } from "../components/agents/AgentActionsProvider.tsx";
import {
  AgentChat,
  ChatPlaceholder,
} from "../components/consultation/AgentChat.tsx";
import { AgentPanel } from "../components/consultation/AgentPanel.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useAgent } from "../hooks/agents/useAgentQueries.ts";

/**
 * Vista Consultar: arriba el contexto del agente y debajo el chat. El agente
 * elegido vive en la URL (`/consultar/:agentId`); al eliminarlo se vuelve a
 * `/consultar`. La `key` reinicia la conversación al cambiar de agente.
 */
export function ConsultPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { data: agent } = useAgent(agentId);

  return (
    <AgentActionsProvider onDeleted={() => navigate("/consultar")}>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Prueba tus agentes"
          title="Consultar"
          description="Elige un agente, revisa sus instrucciones y pruébalo en el chat."
        />
        <AgentPanel agentId={agentId} />
        {agent ? (
          <AgentChat key={agent.id} agent={agent} />
        ) : (
          <ChatPlaceholder />
        )}
      </div>
    </AgentActionsProvider>
  );
}

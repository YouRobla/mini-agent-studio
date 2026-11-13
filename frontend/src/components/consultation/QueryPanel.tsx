import type { Agent } from "../../types/agent.ts";
import { AgentChat } from "./AgentChat.tsx";
import { CHAT_HEIGHT } from "./chatLayout.ts";

/**
 * Chat de Consultar: el del agente elegido, o un aviso para elegir uno. La
 * `key` reinicia consulta y respuesta al cambiar de agente.
 */
export function QueryPanel({ agent }: { agent: Agent | undefined }) {
  if (agent) return <AgentChat key={agent.id} agent={agent} />;

  return (
    <section
      className={`card card-border min-w-0 items-center justify-center bg-base-100 px-6 text-center ${CHAT_HEIGHT}`}
    >
      <h2 className="font-semibold">Elige un agente para empezar</h2>
      <p className="mt-2 max-w-sm text-sm text-base-content/70">
        Selecciónalo arriba; aquí podrás escribirle y ver su respuesta.
      </p>
    </section>
  );
}

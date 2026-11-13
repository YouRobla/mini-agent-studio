import type { Agent } from "../../types/agent.ts";
import { formatShortDate } from "../../utils/formatDate.ts";

/**
 * Contexto del agente elegido: sus instrucciones (lo que un modelo real
 * recibiría como mensaje de sistema), en un `collapse` de daisyUI abierto por
 * defecto que se puede plegar para dar más espacio al chat.
 */
export function AgentDetails({ agent }: { agent: Agent }) {
  return (
    <details
      className="collapse collapse-arrow border border-base-300 bg-base-200"
      open
    >
      <summary className="collapse-title text-sm font-semibold">
        Instrucciones
        <span className="ml-2 font-normal text-base-content/60">
          {agent.instructions.length} caracteres · Creado el{" "}
          {formatShortDate(agent.createdAt)}
        </span>
      </summary>
      <div className="collapse-content">
        <p className="max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-base-content/80 [overflow-wrap:anywhere]">
          {agent.instructions}
        </p>
      </div>
    </details>
  );
}

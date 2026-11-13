import { useState } from "react";
import type { Agent } from "../../types/agent.ts";
import { formatAgentDate } from "../agents/formatAgentDate.ts";

/** A partir de este tamaño las instrucciones se muestran recortadas. */
const LONG_INSTRUCTIONS = 220;

/**
 * Contexto del agente elegido: sus instrucciones (que el modelo recibiría como
 * mensaje de sistema) y la fecha de creación. Las instrucciones largas se
 * recortan a tres líneas con un botón para verlas completas.
 */
export function AgentDetails({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);
  const isLong =
    agent.instructions.length > LONG_INSTRUCTIONS ||
    agent.instructions.split("\n").length > 3;

  return (
    <div className="border-t border-base-300 pt-4">
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-semibold">Instrucciones</h2>
        <span className="text-xs text-base-content/60">
          {agent.instructions.length} caracteres · Creado el{" "}
          {formatAgentDate(agent.createdAt)}
        </span>
      </div>
      <p
        id="agent-instructions-text"
        className={`text-sm leading-relaxed whitespace-pre-wrap text-base-content/80 [overflow-wrap:anywhere] ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {agent.instructions}
      </p>
      {isLong && (
        <button
          type="button"
          className="btn btn-link btn-xs mt-1 px-0"
          aria-expanded={expanded}
          aria-controls="agent-instructions-text"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Mostrar menos" : "Mostrar todo"}
        </button>
      )}
    </div>
  );
}

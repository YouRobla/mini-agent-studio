import { Link } from "react-router";
import type { Agent } from "../../types/agent.ts";

/** Botón que abre la vista Consultar con el agente ya elegido. */
export function ConsultAgentLink({ agent }: { agent: Agent }) {
  return (
    <Link
      className="btn btn-sm"
      to={`/consultar/${encodeURIComponent(agent.id)}`}
      aria-label={`Consultar con ${agent.name}`}
    >
      Consultar
      <svg
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
    </Link>
  );
}

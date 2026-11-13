import { Link } from "react-router";
import { paths } from "../../paths.ts";
import type { Agent } from "../../types/agent.ts";
import { ArrowUpRightIcon } from "../ui/icons.tsx";

/** Botón que abre la vista Consultar con el agente ya elegido. */
export function ConsultAgentLink({ agent }: { agent: Agent }) {
  return (
    <Link
      className="btn btn-sm max-sm:btn-square"
      to={paths.consult(agent.id)}
      aria-label={`Consultar con ${agent.name}`}
    >
      {/* En móvil solo se ve la flecha; el aria-label nombra la acción. */}
      <span className="max-sm:hidden">Consultar</span>
      <ArrowUpRightIcon className="size-3.5" />
    </Link>
  );
}

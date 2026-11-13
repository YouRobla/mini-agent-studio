import type { Agent } from "../../types/agent.ts";
import { useQueryForm } from "../../hooks/useQueryForm.ts";
import { AgentDetails } from "./AgentDetails.tsx";
import { AgentChat } from "./AgentChat.tsx";

export function QueryPanel({ agent }: { agent: Agent | undefined }) {
  if (!agent) {
    return (
      <section className="rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
        <h2 className="font-semibold">Selecciona un agente para empezar</h2>
        <p className="mt-2 text-sm text-base-content/70">
          Aquí podrás escribir tu consulta y revisar su respuesta.
        </p>
      </section>
    );
  }

  return <QueryWorkspace key={agent.id} agent={agent} />;
}

function QueryWorkspace({ agent }: { agent: Agent }) {
  const form = useQueryForm(agent.id);

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(14rem,0.75fr)_minmax(0,1.5fr)]">
      <AgentDetails agent={agent} />
      <AgentChat agent={agent} form={form} />
    </div>
  );
}

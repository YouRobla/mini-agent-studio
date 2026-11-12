import { useState } from "react";
import { AgentForm } from "./components/AgentForm.tsx";
import { AgentList } from "./components/AgentList.tsx";
import { QueryPanel } from "./components/QueryPanel.tsx";
import { useAgents } from "./hooks/useAgents.ts";

function App() {
  // La selección es estado de la interfaz: no se guarda en el servidor.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Se busca en el listado real: si el agente ya no existe, no hay selección.
  const agents = useAgents();
  const selectedAgent = agents.data?.find((agent) => agent.id === selectedId);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Mini Agent Studio</h1>
        <p className="text-base-content/70">
          Crea un agente, selecciónalo y envíale una consulta.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* El agente recién creado queda seleccionado: un paso menos. */}
          <AgentForm onCreated={(agent) => setSelectedId(agent.id)} />
          <AgentList selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* La key reinicia la consulta y la respuesta al cambiar de agente. */}
        <QueryPanel key={selectedAgent?.id ?? "none"} agent={selectedAgent} />
      </div>
    </main>
  );
}

export default App;

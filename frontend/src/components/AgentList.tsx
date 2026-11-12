import { errorMessage } from "../api/client.ts";
import { useAgents } from "../hooks/useAgents.ts";

interface AgentListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AgentList({ selectedId, onSelect }: AgentListProps) {
  const agents = useAgents();

  return (
    <section className="card card-border bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Agentes guardados</h2>

        {agents.isPending && (
          <p className="flex items-center gap-2 text-base-content/70">
            <span className="loading loading-spinner loading-sm" />
            Cargando agentes…
          </p>
        )}

        {agents.isError && (
          <div
            role="alert"
            className="alert alert-error alert-soft alert-vertical"
          >
            <span>{errorMessage(agents.error)}</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => agents.refetch()}
              disabled={agents.isFetching}
            >
              {agents.isFetching ? "Reintentando…" : "Reintentar"}
            </button>
          </div>
        )}

        {agents.isSuccess && agents.data.length === 0 && (
          <p className="text-base-content/70">
            Aún no hay agentes. Crea el primero con el formulario.
          </p>
        )}

        {agents.isSuccess && agents.data.length > 0 && (
          <ul className="list">
            {agents.data.map((agent) => {
              const isSelected = agent.id === selectedId;
              return (
                <li key={agent.id} className="list-row items-center px-0">
                  <div className="list-col-grow min-w-0">
                    <p className="truncate font-medium">{agent.name}</p>
                    <p className="truncate text-sm text-base-content/70">
                      {agent.instructions}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${isSelected ? "btn-active" : "btn-outline"}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(agent.id)}
                  >
                    {isSelected ? "Seleccionado" : "Seleccionar"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

import { useState } from "react";
import { errorMessage } from "../../api/client.ts";
import { useAgents } from "../../hooks/useAgents.ts";
import { useAgentsListParams } from "../../hooks/useAgentsListParams.ts";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.ts";
import type { Agent } from "../../types/agent.ts";
import { ErrorAlert } from "../ui/ErrorAlert.tsx";
import { Pagination } from "../ui/Pagination.tsx";
import { AgentCard } from "./AgentCard.tsx";
import { AgentRow } from "./AgentRow.tsx";
import {
  AgentsEmptyState,
  AgentsNoResults,
} from "./AgentsEmptyState.tsx";
import { AgentsSkeleton } from "./AgentsSkeleton.tsx";
import { AgentsToolbar, type AgentView } from "./AgentsToolbar.tsx";

interface AgentListProps {
  onCreate: () => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

/**
 * Sección «Agentes guardados». Lee página, orden y búsqueda de la URL, se los pide
 * al backend (que filtra, ordena y pagina) y muestra lo que responde: carga,
 * error, vacío o resultados. Crear, editar y eliminar los resuelve la página.
 */
export function AgentList({ onCreate, onEdit, onDelete }: AgentListProps) {
  const { page, sort, search, setPage, setSort, setSearch } =
    useAgentsListParams();
  const [view, setView] = useState<AgentView>("grid");
  // El buscador escribe en la URL al instante; la petición espera 250 ms.
  const debouncedSearch = useDebouncedValue(search, 250);

  const agents = useAgents({ page, sort, search: debouncedSearch });
  const totalAll = agents.data?.meta.totalAll;

  /** Lo que se ve bajo la barra: el primer estado que se cumple. */
  function content() {
    if (agents.isPending) return <AgentsSkeleton view={view} />;

    if (agents.isError) {
      return (
        <ErrorAlert
          message={errorMessage(agents.error)}
          onRetry={() => agents.refetch()}
          retrying={agents.isFetching}
        />
      );
    }

    const { items, meta } = agents.data;

    if (meta.totalAll === 0) return <AgentsEmptyState onCreate={onCreate} />;

    if (items.length === 0) {
      return (
        <AgentsNoResults
          search={debouncedSearch}
          onClearFilters={() => setSearch("")}
        />
      );
    }

    return (
      <>
        {/* Atenuado mientras llega la página nueva y aún se ve la anterior. */}
        <div
          className={`transition-opacity ${agents.isPlaceholderData ? "opacity-65" : ""}`}
        >
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <ul className="list divide-y divide-base-300/70">
              {items.map((agent) => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
        </div>
        <Pagination
          meta={meta}
          isUpdating={agents.isFetching && agents.isPlaceholderData}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <section
      className="card card-border min-w-0 bg-base-100"
      aria-labelledby="agents-list-title"
    >
      <div className="card-body gap-3.5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="agents-list-title" className="card-title text-lg">
              Agentes guardados
            </h2>
            {totalAll !== undefined && (
              <span
                className="badge badge-outline badge-sm"
                aria-label={`${totalAll} agentes guardados`}
              >
                {totalAll}
              </span>
            )}
            {agents.isFetching && !agents.isPending && (
              <span
                className="loading loading-spinner loading-xs text-base-content/60"
                aria-label="Sincronizando agentes"
              />
            )}
          </div>

          <AgentsToolbar
            searchInput={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        </div>

        {content()}
      </div>
    </section>
  );
}

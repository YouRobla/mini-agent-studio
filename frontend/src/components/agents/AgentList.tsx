import { useEffect, useState } from "react";
import { errorMessage } from "../../api/client.ts";
import { DEFAULT_AGENTS_LIMIT, useAgents } from "../../hooks/useAgents.ts";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.ts";
import type { Agent, AgentSort } from "../../types/agent.ts";
import { useToast } from "../ui/toast/useToast.ts";
import { Pagination } from "../ui/Pagination.tsx";
import { AgentCard } from "./AgentCard.tsx";
import { AgentFormModal } from "./AgentFormModal.tsx";
import { AgentRow } from "./AgentRow.tsx";
import { AgentsEmptyState } from "./AgentsEmptyState.tsx";
import { AgentsSkeleton } from "./AgentsSkeleton.tsx";
import { DeleteAgentDialog } from "./DeleteAgentDialog.tsx";
import { AgentsToolbar, type AgentView } from "./AgentsToolbar.tsx";

interface AgentListProps {
  page: number;
  sort: AgentSort;
  searchInput: string;
  onPageChange: (page: number) => void;
  onSortChange: (sort: AgentSort) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onRequestCreate: () => void;
}

/**
 * Listado de agentes guardados. Pide los datos y decide qué estado mostrar
 * (carga, error, vacío o resultados); el detalle visual está en los
 * componentes hijos.
 */
export function AgentList({
  page,
  sort,
  searchInput,
  onPageChange,
  onSortChange,
  onSearchChange,
  onClearFilters,
  onRequestCreate,
}: AgentListProps) {
  const [view, setView] = useState<AgentView>("grid");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const toast = useToast();
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const agents = useAgents({
    page,
    limit: DEFAULT_AGENTS_LIMIT,
    search: debouncedSearch,
    sort,
  });

  // Si la página pedida ya no existe (por ejemplo, tras filtrar), ir a la última.
  useEffect(() => {
    const meta = agents.data?.meta;
    if (
      agents.isSuccess &&
      !agents.isPlaceholderData &&
      meta &&
      meta.totalPages > 0 &&
      page > meta.totalPages
    ) {
      onPageChange(meta.totalPages);
    }
  }, [
    agents.isSuccess,
    agents.isPlaceholderData,
    agents.data,
    page,
    onPageChange,
  ]);

  const meta = agents.data?.meta;
  const items = agents.data?.items ?? [];

  return (
    <>
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
              {meta && agents.isSuccess && (
                <span
                  className="badge badge-outline badge-sm"
                  aria-label={`${meta.totalAll} agentes guardados`}
                >
                  {meta.totalAll}
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
              searchInput={searchInput}
              onSearchChange={onSearchChange}
              sort={sort}
              onSortChange={onSortChange}
              view={view}
              onViewChange={setView}
            />
          </div>

          {agents.isPending && <AgentsSkeleton view={view} />}

          {agents.isError && (
            <div
              role="alert"
              className="alert alert-error alert-vertical sm:alert-horizontal"
            >
              <span className="flex-1">{errorMessage(agents.error)}</span>
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

          {agents.isSuccess && meta && items.length === 0 && (
            <AgentsEmptyState
              variant={meta.totalAll === 0 ? "empty" : "no-results"}
              search={debouncedSearch}
              onCreate={onRequestCreate}
              onClearFilters={onClearFilters}
            />
          )}

          {agents.isSuccess && items.length > 0 && (
            <div
              className={
                agents.isPlaceholderData
                  ? "opacity-65 transition-opacity"
                  : "transition-opacity"
              }
            >
              {view === "grid" ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onEdit={setEditingAgent}
                      onDelete={setDeletingAgent}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Agente</th>
                        <th className="hidden md:table-cell">Instrucciones</th>
                        <th className="hidden sm:table-cell">Creado</th>
                        <th>
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((agent) => (
                        <AgentRow
                          key={agent.id}
                          agent={agent}
                          onEdit={setEditingAgent}
                          onDelete={setDeletingAgent}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {agents.isSuccess && meta && (
            <Pagination
              meta={meta}
              isUpdating={agents.isFetching && agents.isPlaceholderData}
              onPageChange={onPageChange}
              onPrefetch={agents.prefetchPage}
            />
          )}
        </div>
      </section>

      {editingAgent && (
        <AgentFormModal
          key={editingAgent.id}
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSaved={(saved) =>
            toast.success(`Agente «${saved.name}» actualizado`)
          }
        />
      )}

      {deletingAgent && (
        <DeleteAgentDialog
          key={deletingAgent.id}
          agent={deletingAgent}
          onClose={() => setDeletingAgent(null)}
          onDeleted={(deleted) => {
            setDeletingAgent(null);
            toast.success(`Agente «${deleted.name}» eliminado`);
          }}
        />
      )}
    </>
  );
}

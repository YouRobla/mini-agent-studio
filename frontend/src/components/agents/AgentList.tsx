import { useEffect, useState } from "react";
import { errorMessage } from "../../api/client.ts";
import { useAgents } from "../../hooks/agents/useAgentQueries.ts";
import { useAgentsListParams } from "../../hooks/agents/useAgentsListParams.ts";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.ts";
import type { Agent } from "../../types/agent.ts";
import { useToast } from "../ui/toast/useToast.ts";
import { Pagination } from "../ui/Pagination.tsx";
import { AgentCard } from "./AgentCard.tsx";
import { AgentFormModal } from "./AgentFormModal.tsx";
import { AgentRow } from "./AgentRow.tsx";
import { AgentsEmptyState } from "./AgentsEmptyState.tsx";
import { AgentsSkeleton } from "./AgentsSkeleton.tsx";
import { DeleteAgentDialog } from "./DeleteAgentDialog.tsx";
import { AgentsToolbar, type AgentView } from "./AgentsToolbar.tsx";

/**
 * Listado de agentes guardados. Lee página, orden y búsqueda de la URL, pide
 * los datos y decide qué estado mostrar (carga, error, vacío o resultados).
 * También abre los modales de editar y eliminar. El detalle visual está en
 * los componentes hijos.
 */
export function AgentList({
  onRequestCreate,
}: {
  onRequestCreate: () => void;
}) {
  const { page, sort, search, setPage, setSort, setSearch } =
    useAgentsListParams();
  const [view, setView] = useState<AgentView>("grid");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const toast = useToast();
  // El buscador escribe en la URL al instante; la petición espera 250 ms.
  const debouncedSearch = useDebouncedValue(search, 250);

  const agents = useAgents({ page, sort, search: debouncedSearch });

  // Si la página pedida ya no existe (por ejemplo, tras eliminar el último
  // agente de la última página), ir a la última que sí existe.
  const totalPages = agents.data?.meta.totalPages ?? 0;
  const isFresh = agents.isSuccess && !agents.isPlaceholderData;
  useEffect(() => {
    if (isFresh && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [isFresh, totalPages, page, setPage]);

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
              searchInput={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
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
              onClearFilters={() => setSearch("")}
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
                <ul className="list divide-y divide-base-300/70">
                  {items.map((agent) => (
                    <AgentRow
                      key={agent.id}
                      agent={agent}
                      onEdit={setEditingAgent}
                      onDelete={setDeletingAgent}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}

          {agents.isSuccess && meta && (
            <Pagination
              meta={meta}
              isUpdating={agents.isFetching && agents.isPlaceholderData}
              onPageChange={setPage}
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

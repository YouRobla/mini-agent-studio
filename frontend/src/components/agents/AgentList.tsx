import { useEffect, useState } from "react";
import { Link } from "react-router";
import { errorMessage } from "../../api/client.ts";
import { DEFAULT_AGENTS_LIMIT, useAgents } from "../../hooks/useAgents.ts";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.ts";
import type { Agent, AgentSort } from "../../types/agent.ts";
import { Pagination } from "../ui/Pagination.tsx";
import { AgentDetailsModal } from "./AgentDetailsModal.tsx";
import { AgentsSkeleton } from "./AgentsSkeleton.tsx";

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

const shortDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [inspectedAgent, setInspectedAgent] = useState<Agent | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const agents = useAgents({
    page,
    limit: DEFAULT_AGENTS_LIMIT,
    search: debouncedSearch,
    sort,
  });

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
  }, [agents.isSuccess, agents.isPlaceholderData, agents.data, page, onPageChange]);

  const meta = agents.data?.meta;
  const items = agents.data?.items ?? [];
  const totalBadge = meta ? (meta.totalAll ?? meta.total) : 0;
  const hasActiveSearch = debouncedSearch.trim().length > 0;

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
              {agents.isSuccess && (
                <span
                  className="badge badge-outline badge-sm"
                  aria-label={`${totalBadge} agentes guardados`}
                >
                  {totalBadge}
                </span>
              )}
              {agents.isFetching && !agents.isPending && (
                <span
                  className="loading loading-spinner loading-xs text-base-content/60"
                  aria-label="Sincronizando agentes"
                />
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="input input-sm w-full sm:w-60">
                <svg
                  className="size-4 shrink-0 text-base-content/55"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  className="grow"
                  placeholder="Buscar por nombre o rol…"
                  aria-label="Buscar agentes"
                  value={searchInput}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label="Limpiar búsqueda"
                    onClick={() => onSearchChange("")}
                  >
                    ×
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                <select
                  className="select select-sm flex-1 sm:w-40"
                  aria-label="Ordenar agentes"
                  value={sort}
                  onChange={(event) =>
                    onSortChange(event.target.value as AgentSort)
                  }
                >
                  <option value="recent">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="name">Nombre (A–Z)</option>
                </select>

                <div
                  className="join shrink-0"
                  role="group"
                  aria-label="Formato de visualización"
                >
                  <button
                    type="button"
                    className={`join-item btn btn-sm btn-square ${
                      view === "grid" ? "btn-active" : ""
                    }`}
                    aria-label="Vista en cuadrícula"
                    aria-pressed={view === "grid"}
                    title="Vista en cuadrícula"
                    onClick={() => setView("grid")}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`join-item btn btn-sm btn-square ${
                      view === "list" ? "btn-active" : ""
                    }`}
                    aria-label="Vista en lista compacta"
                    aria-pressed={view === "list"}
                    title="Vista en lista compacta"
                    onClick={() => setView("list")}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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

          {agents.isSuccess && meta && meta.totalAll === 0 && (
            <div className="rounded-box border border-dashed border-base-300 px-6 py-12 text-center">
              <p className="font-semibold">Aquí empieza tu colección</p>
              <p className="mt-1.5 text-sm text-base-content/70">
                Aún no hay agentes guardados. Crea el primero para empezar a
                probar instrucciones.
              </p>
              <button
                type="button"
                className="btn btn-sm mt-4"
                onClick={onRequestCreate}
              >
                + Crear primer agente
              </button>
            </div>
          )}

          {agents.isSuccess &&
            meta &&
            meta.totalAll > 0 &&
            items.length === 0 && (
              <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
                <p className="font-semibold">
                  {hasActiveSearch
                    ? `Sin coincidencias para «${debouncedSearch}»`
                    : "No hay agentes en esta página"}
                </p>
                <p className="mt-1.5 text-sm text-base-content/70">
                  {hasActiveSearch
                    ? "Prueba con otro término o limpia el filtro para ver todos tus agentes."
                    : "Vuelve a la primera página para ver el listado completo."}
                </p>
                <button
                  type="button"
                  className="btn btn-sm mt-4"
                  onClick={onClearFilters}
                >
                  {hasActiveSearch ? "Limpiar búsqueda" : "Ir a la página 1"}
                </button>
              </div>
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
                    <article
                      key={agent.id}
                      className="card card-border bg-base-100 transition-colors hover:border-base-content/30"
                    >
                      <div className="card-body gap-2 p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-field border border-base-300 bg-base-200 text-sm font-semibold"
                              aria-hidden="true"
                            >
                              {agent.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3
                                className="truncate text-sm font-semibold"
                                title={agent.name}
                              >
                                {agent.name}
                              </h3>
                              <p className="text-xs text-base-content/60">
                                {shortDateFormatter.format(
                                  new Date(agent.createdAt),
                                )}
                              </p>
                            </div>
                          </div>

                          <div
                            className="tooltip tooltip-left"
                            data-tip="Ver instrucciones"
                          >
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-square"
                              aria-label={`Ver instrucciones de ${agent.name}`}
                              onClick={() => setInspectedAgent(agent)}
                            >
                              <svg
                                className="size-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                aria-hidden="true"
                              >
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="2.5" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-base-content/75 [overflow-wrap:anywhere]">
                          {agent.instructions}
                        </p>

                        <div className="card-actions mt-auto items-center justify-between border-t border-base-300/70 pt-2.5">
                          <span className="badge badge-ghost badge-xs">
                            {agent.instructions.length} car.
                          </span>
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
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <ul className="list divide-y divide-base-300/70">
                  {items.map((agent) => (
                    <li
                      key={agent.id}
                      className="list-row items-center gap-3 px-1 py-2.5"
                    >
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-field border border-base-300 bg-base-200 text-sm font-semibold"
                        aria-hidden="true"
                      >
                        {agent.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="list-col-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {agent.name}
                          </p>
                          <span className="hidden text-xs text-base-content/55 sm:inline">
                            ·{" "}
                            {shortDateFormatter.format(
                              new Date(agent.createdAt),
                            )}
                          </span>
                        </div>
                        <p className="truncate text-xs text-base-content/70">
                          {agent.instructions}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setInspectedAgent(agent)}
                          aria-label={`Ver instrucciones de ${agent.name}`}
                        >
                          Detalles
                        </button>
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
                      </div>
                    </li>
                  ))}
                </ul>
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

      <AgentDetailsModal
        agent={inspectedAgent}
        onClose={() => setInspectedAgent(null)}
      />
    </>
  );
}

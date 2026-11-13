import type { AgentSort } from "../../types/agent.ts";

export type AgentView = "grid" | "list";

interface AgentsToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  sort: AgentSort;
  onSortChange: (sort: AgentSort) => void;
  view: AgentView;
  onViewChange: (view: AgentView) => void;
}

/** Búsqueda, orden y formato de visualización del listado. */
export function AgentsToolbar({
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: AgentsToolbarProps) {
  return (
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
          onChange={(event) => onSortChange(event.target.value as AgentSort)}
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
            onClick={() => onViewChange("grid")}
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
            onClick={() => onViewChange("list")}
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
  );
}

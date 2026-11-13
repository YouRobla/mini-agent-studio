import { SEARCH_MAX_LENGTH } from "../../schemas/agent.schemas.ts";
import type { AgentSort } from "../../types/agent.ts";
import { GridIcon, ListIcon, SearchIcon } from "../ui/icons.tsx";

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
        <SearchIcon className="size-4 shrink-0 text-base-content/55" />
        <input
          type="search"
          className="grow"
          placeholder="Buscar por nombre o rol…"
          aria-label="Buscar agentes"
          maxLength={SEARCH_MAX_LENGTH}
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
            <GridIcon />
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
            <ListIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

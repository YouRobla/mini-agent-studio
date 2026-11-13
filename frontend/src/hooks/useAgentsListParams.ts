import { useSearchParams } from "react-router";
import type { AgentSort } from "../types/agent.ts";

interface ListParamsChange {
  page?: number;
  sort?: AgentSort;
  search?: string;
}

function parsePage(raw: string | null): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parseSort(raw: string | null): AgentSort {
  return raw === "oldest" || raw === "name" ? raw : "recent";
}

/**
 * Página, orden y búsqueda del listado, guardados en la URL
 * (`?page=&sort=&search=`) para poder recargar o compartir la vista. Cualquier
 * componente que lo use lee y escribe el mismo estado, sin pasar props.
 *
 * - Los valores por defecto (página 1, «recientes», búsqueda vacía) no se
 *   escriben, para que la URL quede limpia.
 * - `replace: true` evita que cada letra del buscador sea un paso del botón Atrás.
 * - Ordenar o buscar vuelve a la página 1, porque cambia el conjunto de resultados.
 * - Cada cambio parte de la URL actual del navegador y no de la del último
 *   render: si dos cambios llegan seguidos (limpiar la búsqueda y ordenar), el
 *   segundo no deshace el primero.
 */
export function useAgentsListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  function update(change: ListParamsChange) {
    const next = new URLSearchParams(window.location.search);
    const write = (key: string, value: string, isDefault: boolean) => {
      if (isDefault) next.delete(key);
      else next.set(key, value);
    };
    if (change.page !== undefined) {
      write("page", String(change.page), change.page <= 1);
    }
    if (change.sort !== undefined) {
      write("sort", change.sort, change.sort === "recent");
    }
    if (change.search !== undefined) {
      write("search", change.search, change.search.length === 0);
    }
    setSearchParams(next, { replace: true });
  }

  return {
    page: parsePage(searchParams.get("page")),
    sort: parseSort(searchParams.get("sort")),
    search: searchParams.get("search") ?? "",
    setPage: (page: number) => update({ page }),
    setSort: (sort: AgentSort) => update({ sort, page: 1 }),
    setSearch: (search: string) => update({ search, page: 1 }),
    resetFilters: () => update({ page: 1, sort: "recent", search: "" }),
  };
}

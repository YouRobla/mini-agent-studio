/*
 * Estados vacíos del listado, cada uno con la acción para salir de él. El listado
 * elige cuál pintar.
 */

const BOX = "rounded-box border border-dashed border-base-300 px-6 text-center";

/** Todavía no hay ningún agente guardado. */
export function AgentsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className={`${BOX} py-12`}>
      <p className="font-semibold">Aquí empieza tu colección</p>
      <p className="mt-1.5 text-sm text-base-content/70">
        Aún no hay agentes guardados. Crea el primero para empezar a probar
        instrucciones.
      </p>
      <button type="button" className="btn btn-sm mt-4" onClick={onCreate}>
        + Crear primer agente
      </button>
    </div>
  );
}

interface AgentsNoResultsProps {
  search: string;
  onClearFilters: () => void;
}

/** Hay agentes, pero ninguno en esta vista: por la búsqueda o por la página. */
export function AgentsNoResults({
  search,
  onClearFilters,
}: AgentsNoResultsProps) {
  const hasSearch = search.trim().length > 0;
  return (
    <div className={`${BOX} py-10`}>
      <p className="font-semibold">
        {hasSearch
          ? `Sin coincidencias para «${search}»`
          : "No hay agentes en esta página"}
      </p>
      <p className="mt-1.5 text-sm text-base-content/70">
        {hasSearch
          ? "Prueba con otro término o limpia el filtro para ver todos tus agentes."
          : "Vuelve a la primera página para ver el listado completo."}
      </p>
      <button
        type="button"
        className="btn btn-sm mt-4"
        onClick={onClearFilters}
      >
        {hasSearch ? "Limpiar búsqueda" : "Ir a la página 1"}
      </button>
    </div>
  );
}

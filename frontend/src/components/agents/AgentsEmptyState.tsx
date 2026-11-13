interface AgentsEmptyStateProps {
  /** `empty`: no hay ningún agente; `no-results`: hay agentes pero ninguno en esta vista. */
  variant: "empty" | "no-results";
  search: string;
  onCreate: () => void;
  onClearFilters: () => void;
}

/** Estados vacíos del listado, con una acción para salir de ellos. */
export function AgentsEmptyState({
  variant,
  search,
  onCreate,
  onClearFilters,
}: AgentsEmptyStateProps) {
  if (variant === "empty") {
    return (
      <div className="rounded-box border border-dashed border-base-300 px-6 py-12 text-center">
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

  const hasSearch = search.trim().length > 0;
  return (
    <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
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

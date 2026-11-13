interface AgentsSkeletonProps {
  selector?: boolean;
  view?: "grid" | "list";
  count?: number;
}

/** Esqueletos de carga del listado (tarjetas o filas) y del selector de agentes. */
export function AgentsSkeleton({
  selector = false,
  view = "grid",
  count = 6,
}: AgentsSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={
        selector ? "Cargando selector de agentes" : "Cargando agentes"
      }
      aria-busy="true"
    >
      {selector ? (
        <div className="skeleton h-10 w-full" />
      ) : view === "grid" ? (
        <div
          className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3"
          aria-hidden="true"
        >
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="card card-border bg-base-100">
              <div className="card-body gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton size-9 shrink-0 rounded-field" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton h-3.5 w-full" />
                  <div className="skeleton h-3.5 w-4/5" />
                </div>
                <div className="flex items-center justify-between border-t border-base-300/70 pt-2.5">
                  <div className="skeleton h-4 w-16" />
                  <div className="skeleton h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="flex items-center gap-3 py-2.5">
              <div className="skeleton size-9 shrink-0 rounded-field" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-3/4" />
              </div>
              <div className="skeleton h-8 w-24" />
            </div>
          ))}
        </div>
      )}
      <span className="sr-only">Cargando agentes</span>
    </div>
  );
}

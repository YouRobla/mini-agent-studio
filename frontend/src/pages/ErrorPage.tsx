import { isRouteErrorResponse, Link, useRouteError } from "react-router";

/**
 * Error inesperado al pintar una ruta (`ErrorBoundary` de React Router). Muestra
 * un mensaje legible en lugar de una pantalla en blanco y ofrece volver al inicio.
 */
export function ErrorPage() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : null;

  return (
    <section className="card card-border mx-auto my-10 max-w-xl bg-base-100">
      <div className="card-body items-center py-14 text-center">
        <h1 className="text-2xl font-semibold">Algo salió mal</h1>
        <p className="text-base-content/70">
          Ocurrió un error inesperado al mostrar esta página.
        </p>
        {detail && (
          <p className="mt-1 text-sm text-base-content/60 [overflow-wrap:anywhere]">
            {detail}
          </p>
        )}
        <Link to="/" className="btn btn-primary mt-4">
          Volver a Agentes
        </Link>
      </div>
    </section>
  );
}

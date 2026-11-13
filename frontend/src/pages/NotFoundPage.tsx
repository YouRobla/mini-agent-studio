import { Link } from "react-router";

/** Página 404 para rutas desconocidas, con enlace de vuelta a Agentes. */
export function NotFoundPage() {
  return (
    <section className="card card-border mx-auto max-w-xl bg-base-100">
      <div className="card-body items-center py-16 text-center">
        <span className="badge badge-outline mb-3">404</span>
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <p className="mt-2 text-base-content/70">
          La dirección que buscas no está disponible.
        </p>
        <Link to="/" className="btn mt-5">
          Volver a Agentes
        </Link>
      </div>
    </section>
  );
}

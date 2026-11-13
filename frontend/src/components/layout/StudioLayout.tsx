import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { ThemeToggle } from "./ThemeToggle.tsx";

/** Estructura de la app: menú lateral (`drawer` + `menu`), barra superior y contenido. */
export function StudioLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="drawer min-h-dvh bg-base-200 lg:drawer-open">
      <input
        id="studio-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={menuOpen}
        onChange={(event) => setMenuOpen(event.target.checked)}
        tabIndex={-1}
        aria-label="Menú de navegación"
      />
      <div className="drawer-content flex min-h-dvh min-w-0 flex-col">
        <a
          href="#contenido"
          className="btn fixed left-4 top-2 z-50 -translate-y-24 focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <header className="navbar min-h-16 gap-2 border-b border-base-300 bg-base-100 px-4 sm:px-6">
          <label
            htmlFor="studio-drawer"
            className="btn btn-ghost btn-square drawer-button lg:hidden"
            role="button"
            tabIndex={0}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuOpen}
            aria-controls="studio-navigation"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setMenuOpen((open) => !open);
              }
            }}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <Link
            to="/"
            className="min-w-0 flex-1 text-base font-semibold tracking-tight sm:text-lg"
          >
            Mini Agent Studio
          </Link>
          <span
            className="badge badge-outline badge-sm shrink-0 sm:badge-md"
            title="Las respuestas las genera un proveedor de IA simulado"
          >
            Modo simulado
          </span>
          <ThemeToggle />
        </header>
        <main
          id="contenido"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-5"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-40">
        <label
          htmlFor="studio-drawer"
          aria-label="Cerrar menú de navegación"
          className="drawer-overlay"
        />
        <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100 p-4">
          <div className="mb-6 flex items-center gap-3 px-2 py-2">
            <span
              className="flex size-10 items-center justify-center rounded-box bg-neutral text-neutral-content"
              aria-hidden="true"
            >
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="4" y="6" width="16" height="14" rx="4" />
                <path d="M12 3v3M8 16h8" />
                <circle cx="8.5" cy="11" r=".8" />
                <circle cx="15.5" cy="11" r=".8" />
              </svg>
            </span>
            <div>
              <p className="font-semibold">Tu estudio</p>
              <p className="text-xs text-base-content/70">
                Crea. Prueba. Ajusta.
              </p>
            </div>
          </div>
          <nav id="studio-navigation" aria-label="Navegación principal">
            <ul className="menu w-full gap-2 p-0">
              <li className="menu-title px-3 text-xs tracking-wider">
                ESPACIO DE TRABAJO
              </li>
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => (isActive ? "menu-active" : "")}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="2" />
                    <rect x="14" y="3" width="7" height="7" rx="2" />
                    <rect x="3" y="14" width="7" height="7" rx="2" />
                    <rect x="14" y="14" width="7" height="7" rx="2" />
                  </svg>
                  Agentes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/consultar"
                  className={({ isActive }) => (isActive ? "menu-active" : "")}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-3 3V11.5A7.5 7.5 0 0 1 9.5 4h3a7.5 7.5 0 0 1 7.5 7.5Z" />
                    <path d="M7 10h8M7 14h5" />
                  </svg>
                  Consultar
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}

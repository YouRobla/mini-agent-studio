import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Toaster } from "sonner";
import { paths } from "../../paths.ts";
import { MenuIcon } from "../ui/icons.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

/**
 * Ruta raíz: la estructura de la aplicación (`drawer` de daisyUI) con el menú
 * lateral fijo en escritorio y desplegable en móvil, la barra superior y, en el
 * `<Outlet />`, la página de la ruta actual. `<Toaster />` pinta los avisos de
 * `showSuccess` abajo a la derecha.
 */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
              <MenuIcon className="size-5" />
            </label>
            <Link
              to={paths.agents}
              className="min-w-0 flex-1 text-base font-semibold tracking-tight sm:text-lg"
            >
              Mini Agent Studio
            </Link>
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
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}

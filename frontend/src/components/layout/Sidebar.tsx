import { NavLink } from "react-router";
import { paths } from "../../paths.ts";
import { ChatIcon, GridIcon } from "../ui/icons.tsx";
import { AppLogo } from "./AppLogo.tsx";

/** Vistas de la aplicación. Para añadir una, basta con una entrada más. */
const NAV_ITEMS = [
  { to: paths.agents, label: "Agentes", Icon: GridIcon, end: true },
  { to: paths.consult(), label: "Consultar", Icon: ChatIcon, end: false },
];

/** Menú lateral: logo y navegación (`menu` de daisyUI) con la vista activa marcada. */
export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100 p-4">
      <div className="mb-6 flex items-center gap-3 px-2 py-2">
        <span
          className="flex size-10 items-center justify-center rounded-box bg-primary text-primary-content"
          aria-hidden="true"
        >
          <AppLogo className="size-6" />
        </span>
        <div>
          <p className="font-semibold">Tu estudio</p>
          <p className="text-xs text-base-content/70">Crea. Prueba. Ajusta.</p>
        </div>
      </div>
      <nav id="studio-navigation" aria-label="Navegación principal">
        <ul className="menu w-full gap-2 p-0 [--menu-active-bg:var(--color-primary)] [--menu-active-fg:var(--color-primary-content)]">
          <li className="menu-title px-3 text-xs tracking-wider">
            ESPACIO DE TRABAJO
          </li>
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? "menu-active" : "")}
                onClick={onNavigate}
              >
                <Icon className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { AgentsPage } from "./pages/AgentsPage.tsx";
import { ConsultPage } from "./pages/ConsultPage.tsx";
import { ErrorPage } from "./pages/ErrorPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";

/**
 * Rutas de la aplicación (modo de datos de React Router, con objetos de ruta).
 *
 * `AppLayout` pinta el panel y, en su `<Outlet />`, la página de cada ruta. La
 * ruta sin `path` agrupa las páginas para que un error inesperado se muestre con
 * `ErrorPage` dentro del panel, sin perder el menú. El `ErrorBoundary` de la raíz
 * cubre un fallo del propio panel.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        ErrorBoundary: ErrorPage,
        children: [
          { index: true, Component: AgentsPage },
          { path: "consultar/:agentId?", Component: ConsultPage },
          { path: "*", Component: NotFoundPage },
        ],
      },
    ],
  },
]);

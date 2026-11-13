import { Route, Routes } from "react-router";
import { StudioLayout } from "../components/layout/StudioLayout.tsx";
import { AgentsPage } from "../pages/AgentsPage.tsx";
import { ConsultPage } from "../pages/ConsultPage.tsx";
import { NotFoundPage } from "../pages/NotFoundPage.tsx";

/** Rutas: `/` Agentes, `/consultar/:agentId?` Consultar y 404, dentro del panel. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<StudioLayout />}>
        <Route index element={<AgentsPage />} />
        <Route path="consultar/:agentId?" element={<ConsultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

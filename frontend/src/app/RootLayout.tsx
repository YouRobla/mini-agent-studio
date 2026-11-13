import { StudioLayout } from "../components/layout/StudioLayout.tsx";
import { ToastProvider } from "../components/ui/toast/ToastProvider.tsx";

/**
 * Ruta raíz: los avisos (que usan enlaces del router) y el panel con el menú.
 * Las páginas se pintan en el `<Outlet />` de `StudioLayout`.
 */
export function RootLayout() {
  return (
    <ToastProvider>
      <StudioLayout />
    </ToastProvider>
  );
}

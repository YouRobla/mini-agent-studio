import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { isRetryable } from "./api/client.ts";
import { router } from "./router.tsx";
import "./index.css";

/**
 * Caché de datos del servidor (TanStack Query).
 *
 * - Una lectura fallida se repite una sola vez, y solo si puede servir: sin
 *   conexión o error del servidor (5xx). Un 400 o un 404 se muestran al momento.
 * - Las escrituras (crear, editar, eliminar, consultar) nunca se repiten solas:
 *   TanStack Query no reintenta las mutaciones salvo que se le pida.
 * - Los datos se consideran frescos 30 s; pasado ese tiempo se vuelven a pedir al
 *   volver a la pestaña o al montar la vista.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => isRetryable(error) && failureCount < 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

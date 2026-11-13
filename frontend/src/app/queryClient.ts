import { QueryClient } from "@tanstack/react-query";

/**
 * Caché compartida de TanStack Query. Se crea una sola vez, fuera de React.
 * Un reintento basta: si el backend está caído, el error se muestra pronto.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

/**
 * Enlaces de la aplicación. `router.tsx` declara las rutas; aquí se construye
 * cada URL para enlazarla o navegar, así nadie la escribe a mano.
 */
export const paths = {
  agents: "/",
  consult: (agentId?: string) =>
    agentId ? `/consultar/${encodeURIComponent(agentId)}` : "/consultar",
};

import { useQuery } from "@tanstack/react-query";
import { getAiStatus } from "../api/agents.ts";

/** Nombre legible de cada proveedor del backend. */
const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "OpenAI",
};

/**
 * Proveedor de IA activo, para la etiqueta de la barra. No cambia mientras el
 * backend está en marcha, así que se pide una vez (`staleTime: Infinity`).
 * `label` es `null` mientras carga o si el backend no responde.
 */
export function useAiStatus() {
  const status = useQuery({
    queryKey: ["ai", "status"],
    queryFn: getAiStatus,
    staleTime: Infinity,
  });
  const data = status.data;

  if (!data) return { label: null, title: "" };
  if (data.provider === "mock") {
    return {
      label: "Modo simulado",
      title: "Las respuestas las genera un proveedor de IA simulado",
    };
  }
  const name = PROVIDER_LABELS[data.provider] ?? data.provider;
  return {
    label: data.model ? `${name} · ${data.model}` : name,
    title: `Las respuestas las genera ${name}${data.model ? ` (${data.model})` : ""}`,
  };
}

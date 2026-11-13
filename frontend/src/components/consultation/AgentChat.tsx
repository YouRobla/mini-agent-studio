import { errorMessage, fieldError } from "../../api/client.ts";
import { useRunAgent } from "../../hooks/agents/useAgentMutations.ts";
import type { Agent } from "../../types/agent.ts";
import { ChatMessages } from "./ChatMessages.tsx";
import { QueryForm } from "./QueryForm.tsx";

/**
 * Alto del chat: lo que queda de pantalla bajo la barra, el encabezado y el
 * contexto del agente, con un mínimo para pantallas bajas y un máximo para las
 * muy altas.
 */
const CHAT_HEIGHT = "h-[clamp(24rem,calc(100dvh-26rem),48rem)]";

/**
 * Conversación con un agente. Es el contenedor: ejecuta la consulta contra el
 * backend y reparte su estado entre los mensajes y el formulario. Muestra la
 * última consulta y su respuesta; no guarda historial.
 */
export function AgentChat({ agent }: { agent: Agent }) {
  const run = useRunAgent(agent.id);
  // Un error de validación de la consulta ya se muestra junto al campo.
  const error =
    run.isError && !fieldError(run.error, "query")
      ? errorMessage(run.error)
      : null;

  return (
    <section
      className={`card card-border flex min-w-0 flex-col bg-base-100 ${CHAT_HEIGHT}`}
      aria-labelledby="chat-title"
    >
      <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3 sm:px-5">
        <h2 id="chat-title" className="font-semibold">
          Conversación
        </h2>
        {!run.isIdle && !run.isPending && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => run.reset()}
          >
            Limpiar chat
          </button>
        )}
      </div>

      <ChatMessages
        agentName={agent.name}
        query={run.variables?.query}
        isPending={run.isPending}
        result={run.data}
        error={error}
      />

      <QueryForm
        isPending={run.isPending}
        onSend={(input) => run.mutateAsync(input)}
      />
    </section>
  );
}

/** Hueco del chat cuando todavía no hay un agente elegido. */
export function ChatPlaceholder() {
  return (
    <section
      className={`card card-border min-w-0 items-center justify-center bg-base-100 px-6 text-center ${CHAT_HEIGHT}`}
    >
      <h2 className="font-semibold">Elige un agente para empezar</h2>
      <p className="mt-2 max-w-sm text-sm text-base-content/70">
        Selecciónalo arriba; aquí podrás escribirle y ver su respuesta.
      </p>
    </section>
  );
}

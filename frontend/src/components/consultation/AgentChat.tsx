import { errorMessage } from "../../api/client.ts";
import { useQueryForm } from "../../hooks/useQueryForm.ts";
import { AgentAvatar } from "../agents/AgentAvatar.tsx";
import type { Agent } from "../../types/agent.ts";
import { CHAT_HEIGHT } from "./chatLayout.ts";
import { QueryForm } from "./QueryForm.tsx";

/**
 * Conversación con el agente: cabecera, mensajes (con su propio scroll) y el
 * formulario fijo abajo. Muestra la última consulta y su respuesta, la espera
 * mientras el backend responde y cualquier error en un mensaje legible.
 */
export function AgentChat({ agent }: { agent: Agent }) {
  const form = useQueryForm(agent.id);
  const { runAgent, showGeneralError } = form;

  return (
    <section
      className={`card card-border flex min-w-0 flex-col bg-base-100 ${CHAT_HEIGHT}`}
      aria-labelledby="chat-title"
    >
      <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3 sm:px-5">
        <h2 id="chat-title" className="font-semibold">
          Conversación
        </h2>
        {!runAgent.isIdle && !runAgent.isPending && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => runAgent.reset()}
          >
            Limpiar chat
          </button>
        )}
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        aria-label="Mensajes de la consulta"
        tabIndex={0}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
      >
        {runAgent.isIdle && (
          <div className="flex h-full flex-col items-center justify-center px-3 text-center">
            <svg
              className="mb-3 size-8 text-base-content/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z" />
              <path d="M7 9h9M7 13h6" />
            </svg>
            <p className="font-medium">Inicia la conversación</p>
            <p className="mt-1.5 max-w-xs text-sm text-base-content/70">
              Escribe tu consulta abajo; la respuesta aparecerá aquí.
            </p>
          </div>
        )}

        {runAgent.variables && !runAgent.isIdle && (
          <div className="chat chat-end">
            <div className="chat-header mb-1 text-xs text-base-content/70">
              Tú
            </div>
            <div className="chat-bubble chat-bubble-secondary max-w-[85%] whitespace-pre-wrap [overflow-wrap:anywhere]">
              {runAgent.variables.query}
            </div>
          </div>
        )}

        {(runAgent.isPending || runAgent.isSuccess) && (
          <div className="chat chat-start">
            <div className="chat-image">
              <AgentAvatar name={agent.name} />
            </div>
            <div className="chat-header mb-1 text-xs text-base-content/70">
              Agente
            </div>
            <div className="chat-bubble max-w-[85%] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
              {runAgent.isPending ? (
                <>
                  <span
                    className="loading loading-dots loading-sm"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Generando respuesta…</span>
                </>
              ) : (
                runAgent.data?.response
              )}
            </div>
            {runAgent.isSuccess && (
              <div className="chat-footer mt-1 text-xs opacity-60">
                Proveedor: {runAgent.data.provider}
              </div>
            )}
          </div>
        )}

        {showGeneralError && (
          <div role="alert" className="alert alert-error alert-soft">
            {errorMessage(runAgent.error)}
          </div>
        )}
      </div>

      <QueryForm form={form} />
    </section>
  );
}

import type { RunResult } from "../../types/agent.ts";
import { AgentAvatar } from "../agents/AgentAvatar.tsx";
import { ChatIcon } from "../ui/icons.tsx";

interface ConsultMessagesProps {
  agentName: string;
  /** Última consulta enviada. Sin ella se muestra la invitación inicial. */
  query?: string;
  isPending: boolean;
  result?: RunResult;
  error: string | null;
}

/**
 * Mensajes de la consulta (`chat` de daisyUI): la consulta, la respuesta del agente
 * o su espera, y el error si lo hubo. Tiene su propio scroll.
 */
export function ConsultMessages({
  agentName,
  query,
  isPending,
  result,
  error,
}: ConsultMessagesProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label="Mensajes de la consulta"
      tabIndex={0}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
    >
      {!query && (
        <div className="flex h-full flex-col items-center justify-center px-3 text-center">
          <ChatIcon className="mb-3 size-8 text-base-content/50" />
          <p className="font-medium">Inicia la conversación</p>
          <p className="mt-1.5 max-w-xs text-sm text-base-content/70">
            Escribe tu consulta abajo; la respuesta aparecerá aquí.
          </p>
        </div>
      )}

      {query && (
        <div className="chat chat-end">
          <div className="chat-header mb-1 text-xs text-base-content/70">
            Tú
          </div>
          <div className="chat-bubble chat-bubble-primary max-w-[85%] whitespace-pre-wrap [overflow-wrap:anywhere]">
            {query}
          </div>
        </div>
      )}

      {(isPending || result) && (
        <div className="chat chat-start">
          <div className="chat-image">
            <AgentAvatar name={agentName} />
          </div>
          <div className="chat-header mb-1 text-xs text-base-content/70">
            Agente
          </div>
          <div className="chat-bubble max-w-[85%] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
            {result ? (
              result.response
            ) : (
              <>
                <span
                  className="loading loading-dots loading-sm"
                  aria-hidden="true"
                />
                <span className="sr-only">Generando respuesta…</span>
              </>
            )}
          </div>
          {result && (
            <div className="chat-footer mt-1 text-xs opacity-60">
              Proveedor: {result.provider}
            </div>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error alert-soft">
          {error}
        </div>
      )}
    </div>
  );
}

import type { Agent } from "../../types/agent.ts";
import type { useQueryForm } from "../../hooks/useQueryForm.ts";
import { errorMessage } from "../../api/client.ts";
import { QueryForm } from "./QueryForm.tsx";

interface AgentChatProps {
  agent: Agent;
  form: ReturnType<typeof useQueryForm>;
}

export function AgentChat({ agent, form }: AgentChatProps) {
  const { runAgent, showGeneralError } = form;

  return (
    <section
      className="card card-border min-w-0 bg-base-100"
      aria-labelledby="result-title"
    >
      <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3.5 sm:px-5">
        <h2 id="result-title" className="card-title text-base sm:text-lg [overflow-wrap:anywhere]">
          Chat con {agent.name}
        </h2>
        {!runAgent.isIdle && !runAgent.isPending && (
          <button
            type="button"
            className="btn btn-ghost btn-xs shrink-0"
            onClick={() => runAgent.reset()}
          >
            Limpiar chat
          </button>
        )}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="min-h-56 min-w-0 max-h-80 space-y-4 overflow-y-auto p-4 sm:p-5"
        tabIndex={0}
        aria-label="Mensajes de la consulta"
      >
        {runAgent.isIdle && (
          <div className="flex min-h-48 flex-col items-center justify-center px-3 text-center">
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
            <p className="flex-none font-medium">Inicia una consulta</p>
            <p className="mt-1.5 max-w-xs flex-none text-sm text-base-content/70">
              Escribe tu mensaje abajo. La respuesta de este agente aparecerá
              aquí.
            </p>
          </div>
        )}
        {runAgent.variables && !runAgent.isIdle && (
          <div className="chat chat-end">
            <div className="chat-header mb-1 text-xs text-base-content/70">
              Tú
            </div>
            <div className="chat-bubble max-w-[90%] whitespace-pre-wrap [overflow-wrap:anywhere]">
              {runAgent.variables.query}
            </div>
          </div>
        )}
        {(runAgent.isPending || runAgent.isSuccess) && (
          <div className="chat chat-start">
            <div className="chat-header mb-1 break-words text-xs text-base-content/70">
              {agent.name}
            </div>
            <div className="chat-bubble max-w-[90%] bg-base-200 whitespace-pre-wrap leading-relaxed text-base-content [overflow-wrap:anywhere]">
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
          </div>
        )}
        {showGeneralError && (
          <div role="alert" className="alert alert-error alert-soft">
            {errorMessage(runAgent.error)}
          </div>
        )}
        {runAgent.isError && !showGeneralError && (
          <p className="py-6 text-sm text-base-content/70">
            Revisa el campo de consulta antes de volver a ejecutar.
          </p>
        )}
      </div>
      <QueryForm agent={agent} form={form} />
    </section>
  );
}

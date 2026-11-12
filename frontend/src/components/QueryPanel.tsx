import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Agent } from "../api/agents.ts";
import { ApiError, errorMessage } from "../api/client.ts";
import { useRunAgent } from "../hooks/useAgents.ts";
import {
  runAgentSchema,
  type RunAgentInput,
} from "../schemas/agent.schemas.ts";

interface QueryPanelProps {
  agent: Agent | undefined;
}

export function QueryPanel({ agent }: QueryPanelProps) {
  return (
    <section className="card card-border bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Consulta</h2>
        {agent ? (
          <QueryForm agent={agent} />
        ) : (
          <p className="text-base-content/70">
            Selecciona un agente del listado para enviarle una consulta.
          </p>
        )}
      </div>
    </section>
  );
}

function QueryForm({ agent }: { agent: Agent }) {
  const runAgent = useRunAgent(agent.id);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RunAgentInput>({
    resolver: zodResolver(runAgentSchema),
    defaultValues: { query: "" },
  });

  const onSubmit = handleSubmit((values) => {
    runAgent.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiError) {
          const detail = error.details.find((d) => d.field === "query");
          if (detail) setError("query", { message: detail.message });
        }
      },
    });
  });

  const showGeneralError = runAgent.isError && !errors.query;

  return (
    <>
      <div className="rounded-box bg-base-200 p-3 text-sm">
        <p className="font-medium">{agent.name}</p>
        <p className="whitespace-pre-wrap text-base-content/70">
          {agent.instructions}
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <fieldset className="fieldset">
          <label className="fieldset-legend" htmlFor="agent-query">
            Tu consulta
          </label>
          <textarea
            id="agent-query"
            rows={4}
            className={`textarea w-full ${errors.query ? "textarea-error" : ""}`}
            placeholder="Escribe aquí lo que quieres preguntarle al agente"
            aria-invalid={Boolean(errors.query)}
            aria-describedby={errors.query ? "agent-query-error" : undefined}
            {...register("query")}
          />
          {errors.query && (
            <p id="agent-query-error" className="label text-error">
              {errors.query.message}
            </p>
          )}
        </fieldset>

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={runAgent.isPending}
          >
            {runAgent.isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {runAgent.isPending ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
      </form>

      {/* Zona de resultado: carga, respuesta o error. Se anuncia a lectores de pantalla. */}
      <div aria-live="polite">
        {runAgent.isPending && (
          <div className="chat chat-start">
            <div className="chat-header">{agent.name}</div>
            <div className="chat-bubble">
              <span className="loading loading-dots loading-sm" />
              <span className="sr-only">Esperando la respuesta…</span>
            </div>
          </div>
        )}

        {runAgent.isSuccess && (
          <>
            <div className="chat chat-end">
              <div className="chat-header">Tú</div>
              <div className="chat-bubble whitespace-pre-wrap">
                {runAgent.variables.query}
              </div>
            </div>
            <div className="chat chat-start">
              <div className="chat-header">{agent.name}</div>
              <div className="chat-bubble whitespace-pre-wrap">
                {runAgent.data.response}
              </div>
              <div className="chat-footer">
                Proveedor: {runAgent.data.provider}
              </div>
            </div>
          </>
        )}

        {showGeneralError && (
          <div role="alert" className="alert alert-error alert-soft">
            {errorMessage(runAgent.error)}
          </div>
        )}
      </div>
    </>
  );
}

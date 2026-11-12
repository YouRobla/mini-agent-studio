import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Agent } from "../api/agents.ts";
import { ApiError, errorMessage } from "../api/client.ts";
import { useCreateAgent } from "../hooks/useAgents.ts";
import {
  createAgentSchema,
  type CreateAgentInput,
} from "../schemas/agent.schemas.ts";

interface AgentFormProps {
  onCreated: (agent: Agent) => void;
}

export function AgentForm({ onCreated }: AgentFormProps) {
  const createAgent = useCreateAgent();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { name: "", instructions: "" },
  });

  const onSubmit = handleSubmit((values) => {
    createAgent.mutate(values, {
      onSuccess: (agent) => {
        reset();
        onCreated(agent);
      },
      onError: (error) => {
        // Si el servidor rechaza un campo, el mensaje aparece junto a ese campo.
        if (error instanceof ApiError) {
          for (const detail of error.details) {
            if (detail.field === "name" || detail.field === "instructions") {
              setError(detail.field, { message: detail.message });
            }
          }
        }
      },
    });
  });

  // El error general se muestra solo si no se pudo asignar a un campo concreto.
  const hasFieldErrors = Boolean(errors.name || errors.instructions);
  const showGeneralError = createAgent.isError && !hasFieldErrors;

  return (
    <section className="card card-border bg-base-100">
      <form className="card-body" onSubmit={onSubmit} noValidate>
        <h2 className="card-title">Nuevo agente</h2>

        <fieldset className="fieldset">
          <label className="fieldset-legend" htmlFor="agent-name">
            Nombre
          </label>
          <input
            id="agent-name"
            type="text"
            className={`input w-full ${errors.name ? "input-error" : ""}`}
            placeholder="Asistente de resúmenes"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "agent-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="agent-name-error" className="label text-error">
              {errors.name.message}
            </p>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <label className="fieldset-legend" htmlFor="agent-instructions">
            Instrucciones
          </label>
          <textarea
            id="agent-instructions"
            rows={4}
            className={`textarea w-full ${errors.instructions ? "textarea-error" : ""}`}
            placeholder="Eres un asistente que resume textos"
            aria-invalid={Boolean(errors.instructions)}
            aria-describedby={
              errors.instructions ? "agent-instructions-error" : undefined
            }
            {...register("instructions")}
          />
          {errors.instructions && (
            <p id="agent-instructions-error" className="label text-error">
              {errors.instructions.message}
            </p>
          )}
        </fieldset>

        {showGeneralError && (
          <div role="alert" className="alert alert-error alert-soft">
            {errorMessage(createAgent.error)}
          </div>
        )}

        <div className="card-actions justify-end">
          <button
            type="submit"
            className="btn btn-neutral"
            disabled={createAgent.isPending}
          >
            {createAgent.isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {createAgent.isPending ? "Guardando…" : "Guardar agente"}
          </button>
        </div>
      </form>
    </section>
  );
}

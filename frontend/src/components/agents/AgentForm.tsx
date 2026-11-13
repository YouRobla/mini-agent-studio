import { errorMessage } from "../../api/client.ts";
import type { useAgentForm } from "../../hooks/useAgentForm.ts";

interface AgentFormProps {
  form: ReturnType<typeof useAgentForm>;
  onCancel: () => void;
}

export function AgentForm({ form, onCancel }: AgentFormProps) {
  const { register, errors, onSubmit, createAgent, showGeneralError } = form;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <h2 id="create-agent-title" className="text-xl font-semibold">
        Nuevo agente
      </h2>
      <p id="create-agent-description" className="text-sm text-base-content/70">
        Define cómo quieres que se comporte tu asistente.
      </p>

      <fieldset className="fieldset">
        <label className="fieldset-legend" htmlFor="agent-name">
          Nombre
        </label>
        <input
          id="agent-name"
          autoFocus
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
          rows={7}
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

      <div className="modal-action">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={createAgent.isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={createAgent.isPending}
        >
          {createAgent.isPending && (
            <span className="loading loading-spinner loading-sm" />
          )}
          {createAgent.isPending ? "Guardando…" : "Guardar agente"}
        </button>
      </div>
    </form>
  );
}

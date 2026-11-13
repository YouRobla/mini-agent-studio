import { errorMessage } from "../../api/client.ts";
import type { useAgentForm } from "../../hooks/agents/useAgentForm.ts";

type AgentFormMode = "create" | "edit";

interface AgentFormProps {
  mode: AgentFormMode;
  form: ReturnType<typeof useAgentForm>;
  onCancel: () => void;
}

/** Campos de nombre e instrucciones, con errores por campo; sirve para crear y editar. */
export function AgentForm({ mode, form, onCancel }: AgentFormProps) {
  const { register, errors, onSubmit, saveAgent, showGeneralError } = form;
  const isEdit = mode === "edit";

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <h2 id="agent-form-title" className="text-xl font-semibold">
        {isEdit ? "Editar agente" : "Nuevo agente"}
      </h2>
      <p id="agent-form-description" className="text-sm text-base-content/70">
        {isEdit
          ? "Cambia el nombre o las instrucciones de tu asistente."
          : "Define cómo quieres que se comporte tu asistente."}
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
          {errorMessage(saveAgent.error)}
        </div>
      )}

      <div className="modal-action">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={saveAgent.isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saveAgent.isPending}
        >
          {saveAgent.isPending && (
            <span className="loading loading-spinner loading-sm" />
          )}
          {saveAgent.isPending
            ? "Guardando…"
            : isEdit
              ? "Guardar cambios"
              : "Guardar agente"}
        </button>
      </div>
    </form>
  );
}

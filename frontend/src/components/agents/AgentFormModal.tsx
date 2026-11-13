import { useRef } from "react";
import { useAgentForm } from "../../hooks/agents/useAgentForm.ts";
import type { Agent } from "../../types/agent.ts";
import { Modal } from "../ui/Modal.tsx";

interface AgentFormModalProps {
  /** Con `agent` edita ese agente; sin él, crea uno nuevo. */
  agent?: Agent;
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}

/**
 * Formulario de agente en una ventana modal, para crear y para editar. La
 * lógica está en `useAgentForm`; aquí solo los campos. Los errores se muestran
 * dentro del modal y conservan lo escrito; mientras guarda no se puede cerrar.
 */
export function AgentFormModal({
  agent,
  onClose,
  onSaved,
}: AgentFormModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { register, errors, onSubmit, isSaving, generalError } = useAgentForm(
    agent,
    (saved) => {
      dialog.current?.close();
      onSaved(saved);
    },
  );
  const isEdit = Boolean(agent);

  return (
    <Modal
      ref={dialog}
      labelledBy="agent-form-title"
      describedBy="agent-form-description"
      locked={isSaving}
      onClose={onClose}
    >
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

        {generalError && (
          <div role="alert" className="alert alert-error alert-soft">
            {generalError}
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn"
            onClick={() => dialog.current?.close()}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {isSaving
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Guardar agente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

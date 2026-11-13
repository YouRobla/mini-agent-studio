import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { errorMessage, fieldError } from "../../api/client.ts";
import { useCreateAgent, useUpdateAgent } from "../../hooks/useAgents.ts";
import {
  createAgentSchema,
  type CreateAgentInput,
} from "../../schemas/agent.schemas.ts";
import type { Agent } from "../../types/agent.ts";
import { Modal } from "../ui/Modal.tsx";

interface AgentFormModalProps {
  /** Con `agent` edita ese agente; sin él, crea uno nuevo. */
  agent?: Agent;
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}

/**
 * Formulario de agente en una ventana modal, para crear y para editar.
 *
 * React Hook Form guarda los campos y sus errores; Zod (`createAgentSchema`)
 * valida antes de enviar. Si el servidor rechaza un campo, su mensaje se coloca
 * junto a ese campo; si es otro error, se muestra debajo. Lo escrito se conserva
 * y mientras guarda no se puede cerrar.
 */
export function AgentFormModal({
  agent,
  onClose,
  onSaved,
}: AgentFormModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const mutation = agent ? updateAgent : createAgent;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: agent?.name ?? "",
      instructions: agent?.instructions ?? "",
    },
  });

  // Se ejecuta al enviar (no durante el render), por eso puede usar el ref.
  async function save(values: CreateAgentInput) {
    try {
      const saved = agent
        ? await updateAgent.mutateAsync({ id: agent.id, input: values })
        : await createAgent.mutateAsync(values);
      dialog.current?.close();
      onSaved(saved);
    } catch (error) {
      for (const field of ["name", "instructions"] as const) {
        const message = fieldError(error, field);
        if (message) setError(field, { message });
      }
    }
  }

  const isSaving = mutation.isPending;
  // El error general solo se muestra si no se pudo colocar junto a un campo.
  const generalError =
    mutation.isError && !errors.name && !errors.instructions
      ? errorMessage(mutation.error)
      : null;
  const isEdit = Boolean(agent);

  return (
    <Modal
      ref={dialog}
      labelledBy="agent-form-title"
      describedBy="agent-form-description"
      locked={isSaving}
      onClose={onClose}
    >
      {/* Envuelto en una función para que `handleSubmit(save)` no se llame durante
          el render: `save` usa el ref del diálogo (regla react/refs del lint). */}
      <form
        className="space-y-4"
        onSubmit={(event) => handleSubmit(save)(event)}
        noValidate
      >
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

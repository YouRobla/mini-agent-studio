import { useRef, type RefObject } from "react";
import type { Agent } from "../../types/agent.ts";
import { useAgentForm } from "../../hooks/useAgentForm.ts";
import { AgentForm } from "./AgentForm.tsx";

interface CreateAgentModalProps {
  dialogRef?: RefObject<HTMLDialogElement | null>;
  onCreated: (agent: Agent) => void;
}

export function CreateAgentModal({
  dialogRef: externalRef,
  onCreated,
}: CreateAgentModalProps) {
  const internalRef = useRef<HTMLDialogElement>(null);
  const dialogRef = externalRef ?? internalRef;

  const form = useAgentForm((agent) => {
    dialogRef.current?.close();
    onCreated(agent);
  });

  return (
    <>
      <button
        type="button"
        className="btn btn-primary shrink-0"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span aria-hidden="true">+</span> Nuevo agente
      </button>
      <dialog
        ref={dialogRef}
        id="create-agent-modal"
        className="modal"
        aria-labelledby="create-agent-title"
        aria-describedby="create-agent-description"
        onCancel={(event) => {
          if (form.createAgent.isPending) event.preventDefault();
        }}
        onClose={form.resetForm}
      >
        <div className="modal-box w-full max-w-xl">
          <AgentForm form={form} onCancel={() => dialogRef.current?.close()} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            disabled={form.createAgent.isPending}
            aria-label="Cerrar formulario"
          >
            Cerrar
          </button>
        </form>
      </dialog>
    </>
  );
}

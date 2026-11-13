import { useEffect, useRef } from "react";
import type { Agent } from "../../types/agent.ts";
import { useAgentForm } from "../../hooks/agents/useAgentForm.ts";
import { AgentForm } from "./AgentForm.tsx";

interface AgentFormModalProps {
  /** Con `agent` edita ese agente; sin él, crea uno nuevo. */
  agent?: Agent;
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}

/**
 * Modal para crear o editar un agente. Se abre al montarse y el padre lo
 * desmonta al cerrar, así que cada apertura empieza con campos y errores
 * limpios (o con los valores del agente en modo editar).
 */
export function AgentFormModal({
  agent,
  onClose,
  onSaved,
}: AgentFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const form = useAgentForm(agent ?? null, (saved) => {
    dialogRef.current?.close();
    onSaved(saved);
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="agent-form-title"
      aria-describedby="agent-form-description"
      onCancel={(event) => {
        // Durante el guardado no se puede cerrar con Escape.
        if (form.saveAgent.isPending) event.preventDefault();
      }}
      onClose={onClose}
    >
      <div className="modal-box w-full max-w-xl">
        <AgentForm
          mode={agent ? "edit" : "create"}
          form={form}
          onCancel={() => dialogRef.current?.close()}
        />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          disabled={form.saveAgent.isPending}
          aria-label="Cerrar formulario"
        >
          Cerrar
        </button>
      </form>
    </dialog>
  );
}

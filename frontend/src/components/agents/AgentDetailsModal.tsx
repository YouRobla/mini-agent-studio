import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { Agent } from "../../types/agent.ts";

interface AgentDetailsModalProps {
  agent: Agent | null;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function AgentDetailsModal({ agent, onClose }: AgentDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (agent && !dialog.open) {
      dialog.showModal();
    } else if (!agent && dialog.open) {
      dialog.close();
    }
  }, [agent]);

  return (
    <dialog
      ref={dialogRef}
      id="agent-details-modal"
      className="modal"
      aria-labelledby="agent-details-title"
      onClose={onClose}
    >
      <div className="modal-box w-full max-w-xl space-y-4">
        {agent && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-field border border-base-300 bg-base-200 font-semibold"
                  aria-hidden="true"
                >
                  {agent.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2
                    id="agent-details-title"
                    className="text-lg font-semibold [overflow-wrap:anywhere]"
                  >
                    {agent.name}
                  </h2>
                  <p className="text-xs text-base-content/65">
                    Creado el {dateFormatter.format(new Date(agent.createdAt))}
                  </p>
                </div>
              </div>
              <span className="badge badge-outline badge-sm shrink-0">
                {agent.instructions.length} car.
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Instrucciones
              </p>
              <div className="max-h-72 overflow-y-auto rounded-field border border-base-300 bg-base-200 p-4 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                {agent.instructions}
              </div>
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={onClose}>
                Cerrar
              </button>
              <Link
                to={`/consultar/${encodeURIComponent(agent.id)}`}
                className="btn btn-primary"
                onClick={onClose}
              >
                Consultar con este agente
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Cerrar detalles del agente">Cerrar</button>
      </form>
    </dialog>
  );
}

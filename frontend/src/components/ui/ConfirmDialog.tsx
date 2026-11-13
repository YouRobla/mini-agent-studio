import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending: boolean;
  /** Mensaje de error que se muestra dentro del diálogo si la acción falla. */
  error?: string | null;
  onConfirm: () => void;
  /** Se llama cuando el diálogo se cierra (Cancelar, Escape o fondo). */
  onCancel: () => void;
}

/**
 * Confirmación de una acción destructiva. Se abre al montarse (el padre lo
 * renderiza solo mientras hace falta) y no conoce qué se está confirmando.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  isPending,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={(event) => {
        if (isPending) event.preventDefault();
      }}
      onClose={onCancel}
    >
      <div className="modal-box w-full max-w-md">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm text-base-content/80 [overflow-wrap:anywhere]"
        >
          {message}
        </p>

        {error && (
          <div role="alert" className="alert alert-error alert-soft mt-4">
            {error}
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn"
            disabled={isPending}
            onClick={() => dialogRef.current?.close()}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-error"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={isPending} aria-label="Cerrar confirmación">
          Cerrar
        </button>
      </form>
    </dialog>
  );
}

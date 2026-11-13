import { useRef } from "react";
import { Modal } from "./Modal.tsx";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  isPending: boolean;
  /** Error de la acción; se muestra dentro del diálogo para poder reintentar. */
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmación de una acción destructiva. No sabe qué se confirma: recibe los
 * textos y la acción. Mientras la acción está en curso no se puede cerrar.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isPending,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      ref={dialog}
      labelledBy="confirm-title"
      describedBy="confirm-message"
      locked={isPending}
      onClose={onClose}
      size="max-w-md"
    >
      <h2 id="confirm-title" className="text-lg font-semibold">
        {title}
      </h2>
      <p
        id="confirm-message"
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
          onClick={() => dialog.current?.close()}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-error"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending && <span className="loading loading-spinner loading-sm" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

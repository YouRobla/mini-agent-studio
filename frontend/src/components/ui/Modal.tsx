import {
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type Ref,
} from "react";

interface ModalProps {
  /** Acceso al `<dialog>` para cerrarlo con `.close()`, que devuelve el foco a quien lo abrió. */
  ref?: Ref<HTMLDialogElement>;
  /** id del título (y de la descripción) para los lectores de pantalla. */
  labelledBy: string;
  describedBy?: string;
  /** Mientras es true, Escape y el fondo no cierran: hay una operación en curso. */
  locked?: boolean;
  onClose: () => void;
  /** Ancho máximo de la caja, por ejemplo `max-w-md`. */
  size?: string;
  children: ReactNode;
}

/**
 * Ventana modal: `<dialog>` nativo con las clases `modal` de daisyUI. Se abre al
 * montarse, así que el padre la pinta solo mientras hace falta. El navegador
 * gestiona el foco, Escape y el bloqueo del resto de la página. En móvil sale
 * desde abajo y en escritorio centrada.
 */
export function Modal({
  ref,
  labelledBy,
  describedBy,
  locked = false,
  onClose,
  size = "max-w-xl",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        if (locked) event.preventDefault();
      }}
      onClose={onClose}
    >
      <div className={`modal-box w-full ${size}`}>{children}</div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={locked} aria-label="Cerrar ventana">
          Cerrar
        </button>
      </form>
    </dialog>
  );
}

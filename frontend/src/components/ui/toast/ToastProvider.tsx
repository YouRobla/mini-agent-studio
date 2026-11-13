import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastItem } from "./ToastItem.tsx";
import {
  ToastContext,
  type ToastAction,
  type ToastApi,
  type ToastData,
  type ToastKind,
} from "./useToast.ts";

/** Máximo de avisos a la vez: al llegar uno nuevo sale el más antiguo. */
const MAX_VISIBLE = 3;

/**
 * Guarda los avisos y los pinta abajo a la derecha (`toast` de daisyUI).
 * `show` y `dismiss` usan `useCallback` porque el temporizador de cada aviso
 * depende de ellas: si cambiaran en cada render, el aviso nunca caducaría.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const show = useCallback(
    (kind: ToastKind, message: string, action?: ToastAction) => {
      const toast = { id: nextId.current++, kind, message, action };
      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, action) => show("success", message, action),
      error: (message) => show("error", message),
      info: (message) => show("info", message),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      {toasts.length > 0 && (
        <div className="toast toast-end toast-bottom z-50">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext>
  );
}

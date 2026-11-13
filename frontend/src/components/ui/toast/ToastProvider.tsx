import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./ToastContext.ts";
import { ToastViewport } from "./ToastViewport.tsx";
import type {
  ToastAction,
  ToastApi,
  ToastItemData,
  ToastKind,
} from "./toast.types.ts";

/** Máximo de avisos a la vez: al llegar uno nuevo sale el más antiguo. */
const MAX_VISIBLE = 3;

/**
 * Guarda la lista de avisos y expone `useToast()` a toda la aplicación.
 * La animación de entrada es la del componente `toast` de daisyUI.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);
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
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}

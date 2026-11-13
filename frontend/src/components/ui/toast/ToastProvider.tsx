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

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);
  const nextId = useRef(1);

  const show = useCallback(
    (kind: ToastKind, message: string, action?: ToastAction) => {
      const toast: ToastItemData = {
        id: nextId.current++,
        kind,
        message,
        action,
        closing: false,
      };
      setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));
    },
    [],
  );

  /** Inicia la animación de salida; el aviso se quita al terminarla. */
  const dismiss = useCallback((id: number) => {
    if (prefersReducedMotion()) {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      return;
    }
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, closing: true } : toast,
      ),
    );
  }, []);

  const remove = useCallback((id: number) => {
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
      <ToastViewport toasts={toasts} onDismiss={dismiss} onRemove={remove} />
    </ToastContext>
  );
}

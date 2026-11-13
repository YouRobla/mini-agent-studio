import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";

/** Enlace opcional dentro del aviso, por ejemplo «Probar agente». */
export interface ToastAction {
  label: string;
  to: string;
}

export interface ToastData {
  id: number;
  kind: ToastKind;
  message: string;
  action?: ToastAction;
}

export interface ToastApi {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/** Muestra avisos temporales: `toast.success("Guardado")`. */
export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return toast;
}

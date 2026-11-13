/** Tipos de los avisos temporales (toasts). */
export type ToastKind = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  to: string;
}

export interface ToastItemData {
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

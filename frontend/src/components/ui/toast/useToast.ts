import { useContext } from "react";
import { ToastContext } from "./ToastContext.ts";
import type { ToastApi } from "./toast.types.ts";

/** Muestra avisos temporales: `toast.success("Guardado")`. */
export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return toast;
}

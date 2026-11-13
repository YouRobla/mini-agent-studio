import { createContext } from "react";
import type { ToastApi } from "./toast.types.ts";

/** Contexto que comparte la API de avisos; se consume con `useToast()`. */
export const ToastContext = createContext<ToastApi | null>(null);

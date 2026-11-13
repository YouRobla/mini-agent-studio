import { createContext } from "react";
import type { ToastApi } from "./toast.types.ts";

export const ToastContext = createContext<ToastApi | null>(null);

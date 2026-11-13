import type { ToastItemData } from "./toast.types.ts";
import { ToastItem } from "./ToastItem.tsx";

interface ToastViewportProps {
  toasts: ToastItemData[];
  onDismiss: (id: number) => void;
}

/** Esquina inferior derecha donde se apilan los avisos (`toast` de daisyUI). */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-50">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

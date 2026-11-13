import type { ToastItemData } from "./toast.types.ts";
import { ToastItem } from "./ToastItem.tsx";

interface ToastViewportProps {
  toasts: ToastItemData[];
  onDismiss: (id: number) => void;
  onRemove: (id: number) => void;
}

/** Esquina inferior derecha donde se apilan los avisos. */
export function ToastViewport({
  toasts,
  onDismiss,
  onRemove,
}: ToastViewportProps) {
  return (
    <div className="toast toast-end toast-bottom max-w-[calc(100vw-1rem)] sm:max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ErrorIcon, InfoIcon, SuccessIcon } from "../icons.tsx";
import type { ToastData, ToastKind } from "./useToast.ts";

/** Tiempo que permanece visible un aviso. */
const DURATION_MS = 4000;

const STYLE: Record<ToastKind, { alert: string; Icon: typeof SuccessIcon }> = {
  success: { alert: "alert-success", Icon: SuccessIcon },
  error: { alert: "alert-error", Icon: ErrorIcon },
  info: { alert: "alert-info", Icon: InfoIcon },
};

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

/**
 * Un aviso: `alert` de daisyUI con icono, mensaje, acción opcional y cierre.
 * Desaparece solo a los 4 s; el tiempo se pausa con el ratón encima o con el
 * foco dentro, para que dé tiempo a leerlo o a pulsar la acción.
 */
export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, kind, message, action } = toast;
  const { alert, Icon } = STYLE[kind];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(DURATION_MS);

  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, id, onDismiss]);

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`alert ${alert}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <Icon className="size-6 shrink-0" />
      <span>{message}</span>
      <div className="flex gap-1">
        {action && (
          <Link
            to={action.to}
            className="btn btn-sm"
            onClick={() => onDismiss(id)}
          >
            {action.label}
          </Link>
        )}
        <button
          type="button"
          className="btn btn-sm btn-ghost btn-square"
          aria-label="Cerrar aviso"
          onClick={() => onDismiss(id)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

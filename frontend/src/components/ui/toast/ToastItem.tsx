import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { ToastItemData, ToastKind } from "./toast.types.ts";

/** Tiempo que permanece visible un aviso. */
const DURATION_MS = 4000;

const ALERT_CLASS: Record<ToastKind, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
};

/** Trazos de los iconos (mismo estilo que los iconos de la documentación de daisyUI). */
const ICON_PATH: Record<ToastKind, string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: number) => void;
}

/**
 * Un aviso: `alert` de daisyUI con icono, mensaje, acción opcional y cierre.
 * Desaparece solo a los 4 s; el tiempo se pausa con el ratón encima o con el
 * foco dentro, para que dé tiempo a leerlo o a pulsar la acción.
 */
export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, kind, message, action } = toast;
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
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt),
      );
    };
  }, [paused, id, onDismiss]);

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`alert ${ALERT_CLASS[kind]}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <svg
        className="size-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={ICON_PATH[kind]}
        />
      </svg>
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

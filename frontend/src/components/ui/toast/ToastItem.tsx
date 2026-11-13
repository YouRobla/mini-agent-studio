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

const ICON_PATH: Record<ToastKind, IconShape> = {
  success: { circle: true, d: "m8 12 3 3 5-6" },
  error: { circle: true, d: "M12 8v5M12 16.5v.01" },
  info: { circle: true, d: "M12 11v5M12 7.5v.01" },
};

interface IconShape {
  circle: boolean;
  d: string;
}

interface ToastItemProps {
  toast: ToastItemData;
  onDismiss: (id: number) => void;
  onRemove: (id: number) => void;
}

export function ToastItem({ toast, onDismiss, onRemove }: ToastItemProps) {
  const { id, kind, message, action, closing } = toast;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(DURATION_MS);

  // El temporizador se detiene con hover o foco y retoma el tiempo restante.
  useEffect(() => {
    if (paused || closing) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt),
      );
    };
  }, [paused, closing, id, onDismiss]);

  const icon = ICON_PATH[kind];

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      className={`alert ${ALERT_CLASS[kind]} ${closing ? "toast-leave" : "toast-enter"} items-start gap-2 shadow-lg`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      onAnimationEnd={() => {
        if (closing) onRemove(id);
      }}
    >
      <svg
        className="mt-0.5 size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon.circle && <circle cx="12" cy="12" r="9" />}
        <path d={icon.d} />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium [overflow-wrap:anywhere]">
          {message}
        </p>
        {action && (
          <Link
            to={action.to}
            className="btn btn-xs mt-2"
            onClick={() => onDismiss(id)}
          >
            {action.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        className="btn btn-xs btn-square"
        aria-label="Cerrar aviso"
        onClick={() => onDismiss(id)}
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </div>
  );
}

import { AlertIcon, RefreshIcon } from "./icons.tsx";

interface ErrorAlertProps {
  /** Qué no se pudo hacer, por ejemplo «No se pudieron cargar los agentes». */
  title: string;
  /** Por qué y qué hacer, tal como lo explica `errorMessage()`. */
  message: string;
  /** Si se pasa, muestra el botón «Reintentar». */
  onRetry?: () => void;
  retrying?: boolean;
}

/**
 * Error al cargar datos: icono, título, explicación y «Reintentar». Mismo marco
 * discontinuo que los estados vacíos, con el color `error` solo en el icono y el
 * borde, para avisar sin teñir de rojo toda la sección.
 */
export function ErrorAlert({
  title,
  message,
  onRetry,
  retrying = false,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-box border border-dashed border-error/40 bg-error/5 px-6 py-8 text-center text-base"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertIcon className="size-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 max-w-md text-sm text-base-content/70">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <RefreshIcon />
          )}
          {retrying ? "Reintentando…" : "Reintentar"}
        </button>
      )}
    </div>
  );
}

interface ErrorAlertProps {
  message: string;
  /** Si se pasa, muestra el botón «Reintentar». */
  onRetry?: () => void;
  retrying?: boolean;
}

/** Error al cargar datos, con reintento opcional (`alert` de daisyUI). */
export function ErrorAlert({
  message,
  onRetry,
  retrying = false,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="alert alert-error alert-vertical sm:alert-horizontal"
    >
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? "Reintentando…" : "Reintentar"}
        </button>
      )}
    </div>
  );
}

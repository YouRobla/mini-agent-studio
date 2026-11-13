import { Link } from "react-router";

interface SuccessAlertProps {
  message: string;
  action?: { label: string; to: string };
  onDismiss: () => void;
}

export function SuccessAlert({ message, action, onDismiss }: SuccessAlertProps) {
  return (
    <div
      role="status"
      className="alert alert-success alert-vertical sm:alert-horizontal"
    >
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </svg>
      <span className="min-w-0 flex-1 break-words text-sm font-medium">
        {message}
      </span>
      <div className="flex items-center gap-2">
        {action && (
          <Link to={action.to} className="btn btn-sm">
            {action.label}
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </Link>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          aria-label="Cerrar aviso"
          onClick={onDismiss}
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
    </div>
  );
}

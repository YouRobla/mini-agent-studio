import { Link } from "react-router";
import { toast } from "sonner";
import { SuccessIcon } from "./icons.tsx";

/** Enlace opcional dentro del aviso, por ejemplo «Probar agente». */
interface ToastAction {
  label: string;
  to: string;
}

/**
 * Muestra un aviso de éxito: `showSuccess("Guardado")`. Sonner (`<Toaster />` en
 * `AppLayout`) gestiona la cola, el cierre a los 4 s y la pausa con el ratón
 * encima; aquí solo se pinta: un `alert` sobre `base-100` con el icono y la acción
 * en `primary`, para seguir la paleta y el tema activos.
 * Los errores no usan avisos: se quedan en su formulario o diálogo.
 */
export function showSuccess(message: string, action?: ToastAction) {
  toast.custom((id) => (
    <div className="alert w-full border-base-300 bg-base-100 shadow-lg">
      <SuccessIcon className="size-6 shrink-0 text-primary" />
      <span>{message}</span>
      {action && (
        <Link
          to={action.to}
          className="btn btn-sm btn-primary"
          onClick={() => toast.dismiss(id)}
        >
          {action.label}
        </Link>
      )}
    </div>
  ));
}

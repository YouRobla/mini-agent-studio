import { useQueryForm } from "../../hooks/consultation/useQueryForm.ts";
import type { RunAgentInput } from "../../schemas/agent.schemas.ts";
import { SendIcon } from "../ui/icons.tsx";

interface QueryFormProps {
  isPending: boolean;
  /** Envía la consulta. Si la promesa falla, el campo conserva el texto. */
  onSend: (input: RunAgentInput) => Promise<unknown>;
}

/** Campo de la consulta y botón de envío, fijos al pie del chat. */
export function QueryForm({ isPending, onSend }: QueryFormProps) {
  const { register, queryError, onSubmit } = useQueryForm(onSend);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="border-t border-base-300 p-3 sm:p-4"
    >
      <label className="sr-only" htmlFor="agent-query">
        Tu consulta
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="agent-query"
          rows={2}
          className={`textarea min-w-0 flex-1 resize-none ${queryError ? "textarea-error" : ""}`}
          placeholder="Escribe tu consulta…"
          readOnly={isPending}
          aria-invalid={Boolean(queryError)}
          aria-describedby={
            queryError ? "agent-query-error" : "agent-query-hint"
          }
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              if (!isPending) event.currentTarget.form?.requestSubmit();
            }
          }}
          {...register("query")}
        />
        <button
          type="submit"
          className="btn btn-primary max-sm:btn-square"
          disabled={isPending}
        >
          {isPending ? (
            <span
              className="loading loading-spinner loading-sm"
              aria-hidden="true"
            />
          ) : (
            <SendIcon />
          )}
          {/* En móvil solo se ve el icono; el texto sigue siendo el nombre accesible. */}
          <span className="sr-only sm:not-sr-only">
            {isPending ? "Enviando…" : "Enviar consulta"}
          </span>
        </button>
      </div>
      {queryError ? (
        <p
          id="agent-query-error"
          role="alert"
          className="mt-1.5 text-sm text-error"
        >
          {queryError}
        </p>
      ) : (
        <p
          id="agent-query-hint"
          className="mt-1.5 hidden items-center gap-1 text-xs text-base-content/60 sm:flex"
        >
          <kbd className="kbd kbd-xs">Ctrl</kbd> +{" "}
          <kbd className="kbd kbd-xs">Enter</kbd> para enviar
        </p>
      )}
    </form>
  );
}

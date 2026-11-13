import type { useQueryForm } from "../../hooks/consultation/useQueryForm.ts";

interface QueryFormProps {
  form: ReturnType<typeof useQueryForm>;
}

/**
 * Campo de la consulta y botón de envío, fijos al pie del chat. Valida en el
 * cliente (consulta vacía) y muestra también el error que devuelva el servidor.
 */
export function QueryForm({ form }: QueryFormProps) {
  const { register, errors, onSubmit, runAgent } = form;

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
          className={`textarea min-w-0 flex-1 resize-none ${errors.query ? "textarea-error" : ""}`}
          placeholder="Escribe tu consulta…"
          readOnly={runAgent.isPending}
          aria-invalid={Boolean(errors.query)}
          aria-describedby={
            errors.query ? "agent-query-error" : "agent-query-hint"
          }
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          {...register("query")}
        />
        <button
          type="submit"
          className="btn btn-primary max-sm:btn-square"
          disabled={runAgent.isPending}
        >
          {runAgent.isPending ? (
            <span
              className="loading loading-spinner loading-sm"
              aria-hidden="true"
            />
          ) : (
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14" />
            </svg>
          )}
          {/* En móvil solo se ve el icono; el texto sigue siendo el nombre accesible. */}
          <span className="sr-only sm:not-sr-only">
            {runAgent.isPending ? "Enviando…" : "Enviar consulta"}
          </span>
        </button>
      </div>
      {errors.query ? (
        <p
          id="agent-query-error"
          role="alert"
          className="mt-1.5 text-sm text-error"
        >
          {errors.query.message}
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

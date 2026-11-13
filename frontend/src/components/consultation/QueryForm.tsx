import type { Agent } from "../../types/agent.ts";
import type { useQueryForm } from "../../hooks/useQueryForm.ts";

interface QueryFormProps {
  agent: Agent;
  form: ReturnType<typeof useQueryForm>;
}

export function QueryForm({ agent, form }: QueryFormProps) {
  const { register, errors, onSubmit, runAgent } = form;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-3 border-t border-base-300 p-4 sm:p-5"
    >
      <label className="block text-sm font-semibold" htmlFor="agent-query">
        Tu mensaje
      </label>
      <textarea
        id="agent-query"
        rows={3}
        className={`textarea w-full resize-y ${errors.query ? "textarea-error" : ""}`}
        placeholder={`Escribe una consulta para ${agent.name}…`}
        readOnly={runAgent.isPending}
        aria-invalid={Boolean(errors.query)}
        aria-describedby={errors.query ? "agent-query-error" : undefined}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        {...register("query")}
      />
      {errors.query && (
        <p id="agent-query-error" role="alert" className="text-sm text-error">
          {errors.query.message}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden items-center gap-1 text-xs text-base-content/55 sm:flex">
          Atajo: <kbd className="kbd kbd-xs">Ctrl</kbd> +{" "}
          <kbd className="kbd kbd-xs">Enter</kbd>
        </p>
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
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
          {runAgent.isPending ? "Enviando…" : "Enviar consulta"}
        </button>
      </div>
    </form>
  );
}

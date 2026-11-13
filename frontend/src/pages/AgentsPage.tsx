import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { AgentList } from "../components/agents/AgentList.tsx";
import { AgentFormModal } from "../components/agents/AgentFormModal.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useToast } from "../components/ui/toast/useToast.ts";
import type { AgentSort } from "../types/agent.ts";

function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function parseSort(raw: string | null): AgentSort {
  if (raw === "oldest" || raw === "name") return raw;
  return "recent";
}

export function AgentsPage() {
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get("page"));
  const sort = parseSort(searchParams.get("sort"));
  const searchInput = searchParams.get("search") ?? "";

  const updateParams = useCallback(
    (next: { page?: number; sort?: AgentSort; search?: string }) => {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);

          if (next.page !== undefined) {
            if (next.page <= 1) updated.delete("page");
            else updated.set("page", String(next.page));
          }
          if (next.sort !== undefined) {
            if (next.sort === "recent") updated.delete("sort");
            else updated.set("sort", next.sort);
          }
          if (next.search !== undefined) {
            if (next.search.length === 0) updated.delete("search");
            else updated.set("search", next.search);
          }

          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => updateParams({ page: nextPage }),
    [updateParams],
  );

  const handleSortChange = useCallback(
    (nextSort: AgentSort) => updateParams({ sort: nextSort, page: 1 }),
    [updateParams],
  );

  const handleSearchChange = useCallback(
    (nextSearch: string) => updateParams({ search: nextSearch, page: 1 }),
    [updateParams],
  );

  const handleClearFilters = useCallback(
    () => updateParams({ search: "", page: 1 }),
    [updateParams],
  );

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Tu espacio de trabajo"
          title="Agentes"
          description="Organiza tus asistentes, busca por rol y pon sus instrucciones a prueba."
        />
        <button
          type="button"
          className="btn btn-primary shrink-0"
          onClick={() => setCreating(true)}
        >
          <span aria-hidden="true">+</span> Nuevo agente
        </button>
      </div>

      <AgentList
        page={page}
        sort={sort}
        searchInput={searchInput}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
        onRequestCreate={() => setCreating(true)}
      />

      {creating && (
        <AgentFormModal
          onClose={() => setCreating(false)}
          onSaved={(agent) => {
            toast.success(`Agente «${agent.name}» creado correctamente.`, {
              label: "Probar agente",
              to: `/consultar/${encodeURIComponent(agent.id)}`,
            });
            updateParams({ page: 1, sort: "recent", search: "" });
          }}
        />
      )}
    </div>
  );
}

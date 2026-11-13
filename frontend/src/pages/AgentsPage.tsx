import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AgentList } from "../components/agents/AgentList.tsx";
import { CreateAgentModal } from "../components/agents/CreateAgentModal.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { SuccessAlert } from "../components/ui/SuccessAlert.tsx";
import type { Agent, AgentSort } from "../types/agent.ts";

function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function parseSort(raw: string | null): AgentSort {
  if (raw === "oldest" || raw === "name") return raw;
  return "recent";
}

export function AgentsPage() {
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const createDialogRef = useRef<HTMLDialogElement>(null);

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
        <CreateAgentModal
          dialogRef={createDialogRef}
          onCreated={(agent) => {
            setCreatedAgent(agent);
            updateParams({ page: 1, sort: "recent", search: "" });
          }}
        />
      </div>

      {createdAgent && (
        <SuccessAlert
          message={`Agente «${createdAgent.name}» creado correctamente.`}
          action={{
            label: "Probar agente",
            to: `/consultar/${encodeURIComponent(createdAgent.id)}`,
          }}
          onDismiss={() => setCreatedAgent(null)}
        />
      )}

      <AgentList
        page={page}
        sort={sort}
        searchInput={searchInput}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
        onRequestCreate={() => createDialogRef.current?.showModal()}
      />
    </div>
  );
}

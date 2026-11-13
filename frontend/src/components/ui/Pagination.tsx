import type { PaginationMeta } from "../../types/agent.ts";

interface PaginationProps {
  meta: PaginationMeta;
  isUpdating?: boolean;
  onPageChange: (page: number) => void;
  onPrefetch?: (page: number) => void;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function buildPageRange(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push("ellipsis-left");
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < totalPages - 1) pages.push("ellipsis-right");

  pages.push(totalPages);
  return pages;
}

export function Pagination({
  meta,
  isUpdating = false,
  onPageChange,
  onPrefetch,
}: PaginationProps) {
  if (meta.total === 0) return null;

  const startItem = Math.min((meta.page - 1) * meta.limit + 1, meta.total);
  const endItem = Math.min(meta.page * meta.limit, meta.total);
  const pages = buildPageRange(meta.page, meta.totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-base-300 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-base-content/70">
        <span>
          Mostrando{" "}
          <strong className="font-semibold text-base-content">
            {startItem}–{endItem}
          </strong>{" "}
          de{" "}
          <strong className="font-semibold text-base-content">
            {meta.total}
          </strong>{" "}
          {meta.total === 1 ? "agente" : "agentes"}
        </span>
        {isUpdating && (
          <span
            className="loading loading-spinner loading-xs text-base-content/60"
            aria-label="Actualizando página"
          />
        )}
      </div>

      {meta.totalPages > 1 && (
        <nav aria-label="Paginación de agentes">
          <div className="join">
            <button
              type="button"
              className="join-item btn btn-sm"
              disabled={!meta.hasPrevPage}
              onClick={() => onPageChange(meta.page - 1)}
              onMouseEnter={() =>
                meta.hasPrevPage && onPrefetch?.(meta.page - 1)
              }
              onFocus={() => meta.hasPrevPage && onPrefetch?.(meta.page - 1)}
              aria-label="Página anterior"
            >
              «
            </button>

            {pages.map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  type="button"
                  className={`join-item btn btn-sm ${
                    item === meta.page ? "btn-active" : ""
                  }`}
                  onClick={() => onPageChange(item)}
                  onMouseEnter={() => item !== meta.page && onPrefetch?.(item)}
                  onFocus={() => item !== meta.page && onPrefetch?.(item)}
                  aria-current={item === meta.page ? "page" : undefined}
                  aria-label={`Página ${item}`}
                >
                  {item}
                </button>
              ) : (
                <span
                  key={item}
                  className="join-item btn btn-sm btn-disabled"
                  aria-hidden="true"
                >
                  …
                </span>
              ),
            )}

            <button
              type="button"
              className="join-item btn btn-sm"
              disabled={!meta.hasNextPage}
              onClick={() => onPageChange(meta.page + 1)}
              onMouseEnter={() =>
                meta.hasNextPage && onPrefetch?.(meta.page + 1)
              }
              onFocus={() => meta.hasNextPage && onPrefetch?.(meta.page + 1)}
              aria-label="Página siguiente"
            >
              »
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

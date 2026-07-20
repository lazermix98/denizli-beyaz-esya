"use client";

import type { PaginationMeta } from "../../features/shared/types";

const pageSizes = [10, 25, 50, 100];

function pages(meta: PaginationMeta) {
  const start = Math.max(1, meta.page - 2);
  const end = Math.min(meta.totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
}: {
  meta?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}) {
  if (!meta) return null;
  const disabledPrevious = meta.page <= 1;
  const disabledNext = meta.page >= meta.totalPages;

  return (
    <nav className="pagination" aria-label="Sayfalama">
      <p className="pagination-info" aria-live="polite">
        {meta.from}-{meta.to} / {meta.total} kayıt
        <span>Toplam {meta.totalPages} sayfa</span>
      </p>
      <div className="pagination-controls">
        <button type="button" disabled={disabledPrevious} onClick={() => onPageChange?.(1)} aria-label="İlk sayfa">İlk</button>
        <button type="button" disabled={disabledPrevious} onClick={() => onPageChange?.(meta.page - 1)}>Önceki</button>
        <div className="page-numbers" role="group" aria-label="Sayfa numaraları">
          {pages(meta).map((page) => (
            <button
              type="button"
              key={page}
              className={page === meta.page ? "active" : ""}
              aria-current={page === meta.page ? "page" : undefined}
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button type="button" disabled={disabledNext} onClick={() => onPageChange?.(meta.page + 1)}>Sonraki</button>
        <button type="button" disabled={disabledNext} onClick={() => onPageChange?.(meta.totalPages)} aria-label="Son sayfa">Son</button>
      </div>
      <label className="page-size">
        Sayfa başına
        <select value={meta.perPage} onChange={(event) => onPerPageChange?.(Number(event.target.value))}>
          {pageSizes.map((size) => <option value={size} key={size}>{size}</option>)}
        </select>
      </label>
    </nav>
  );
}

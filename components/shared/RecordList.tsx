import type { ReactNode } from "react";
import type { PaginationMeta } from "../../features/shared/types";
import { Pagination } from "./Pagination";
import { EmptyState } from "./State";

export function ListSkeleton() {
  return (
    <div className="skeleton-list" aria-label="Yükleniyor">
      {[1, 2, 3].map((item) => <span key={item} />)}
    </div>
  );
}

export function RecordList({
  title,
  items,
  loading,
  pagination,
  onPageChange,
  onPerPageChange,
}: {
  title: string;
  items: string[];
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}) {
  return (
    <section className="list">
      <div className="section-heading">
        <h3>{title}</h3>
        {!loading && <span>{items.length} gösterilen kayıt</span>}
      </div>
      {loading ? <ListSkeleton /> : items.length === 0 ? <EmptyState>No results</EmptyState> : items.map((item) => <p key={item}>{item}</p>)}
      <Pagination meta={pagination} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
    </section>
  );
}

export function CrudCard({
  title,
  items,
  children,
  loading,
  pagination,
  onPageChange,
  onPerPageChange,
}: {
  title: string;
  items: string[];
  children: ReactNode;
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}) {
  return (
    <section className="card">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>Canlı Supabase verisi</span>
      </div>
      {children}
      <RecordList title="Kayıtlar" items={items} loading={loading} pagination={pagination} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
    </section>
  );
}

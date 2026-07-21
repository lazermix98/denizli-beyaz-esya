import type { ReactNode } from "react";
import type { PaginationMeta } from "../../features/shared/types";
import { FilterBar, PageHeader, SectionCard, StatusBadge } from "./AdminUi";
import { Pagination } from "./Pagination";
import { EmptyState } from "./State";

export function ListSkeleton() {
  return (
    <div className="skeleton-list" aria-label="Yükleniyor">
      {[1, 2, 3, 4].map((item) => <span key={item} />)}
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
    <SectionCard title={title} eyebrow={!loading ? `${items.length} gösterilen kayıt` : "Yükleniyor"}>
      {loading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState>No results</EmptyState>
      ) : (
        <div className="data-list">
          {items.map((item) => {
            const [primary, secondary, tertiary] = item.split(" - ");
            return (
              <article className="data-row-card" key={item}>
                <span className="row-avatar">{primary.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{primary}</strong>
                  <small>{secondary || "Kayıt detayı"}</small>
                </div>
                {tertiary && <StatusBadge>{tertiary}</StatusBadge>}
                <button type="button" aria-label={`${primary} işlemleri`}>•••</button>
              </article>
            );
          })}
        </div>
      )}
      <Pagination meta={pagination} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
    </SectionCard>
  );
}

export function CrudCard({
  title,
  description,
  items,
  children,
  loading,
  pagination,
  onPageChange,
  onPerPageChange,
}: {
  title: string;
  description?: string;
  items: string[];
  children: ReactNode;
  loading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}) {
  return (
    <section className="module-page">
      <PageHeader
        eyebrow="Canlı Supabase verisi"
        title={title}
        description={description || "Kayıt oluşturma, listeleme ve sayfalama işlemleri tenant kapsamındaki gerçek verilerle çalışır."}
        actions={<a className="button-link" href="#record-form">Yeni ekle</a>}
      />
      <SectionCard title="Yeni kayıt" eyebrow="Form" id="record-form">
        {children}
      </SectionCard>
      <FilterBar placeholder={`${title} içinde ara`} />
      <RecordList title="Kayıtlar" items={items} loading={loading} pagination={pagination} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
    </section>
  );
}

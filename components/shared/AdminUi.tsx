import type { ReactNode } from "react";

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatCard({
  label,
  value,
  description,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  description?: string;
  trend?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <article className={`stat-card ${tone}`}>
      <span className="stat-icon" aria-hidden="true" />
      <div>
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
      {trend && <em>{trend}</em>}
    </article>
  );
}

export function SectionCard({
  title,
  eyebrow,
  children,
  className = "",
  id,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`section-card ${className}`} id={id}>
      <div className="section-card-head">
        <strong>{title}</strong>
        {eyebrow && <span>{eyebrow}</span>}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return <mark className="status-badge">{children}</mark>;
}

export function FilterBar({ placeholder = "Ara" }: { placeholder?: string }) {
  return (
    <div className="filter-bar">
      <label>
        <span>Arama</span>
        <input placeholder={placeholder} />
      </label>
      <button type="button">Filtrele</button>
      <button type="button">Tarih</button>
    </div>
  );
}

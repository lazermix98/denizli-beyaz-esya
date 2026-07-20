import type { ReactNode } from "react";
import { EmptyState } from "./State";

export function RecordList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="list">
      <h3>{title}</h3>
      {items.length === 0 ? <EmptyState /> : items.map((item) => <p key={item}>{item}</p>)}
    </section>
  );
}

export function CrudCard({ title, items, children }: { title: string; items: string[]; children: ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
      <RecordList title="Kayıtlar" items={items} />
    </section>
  );
}

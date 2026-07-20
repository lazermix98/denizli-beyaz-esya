import { RecordList } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function DashboardPanel({ controller }: { controller: AdminController }) {
  return (
    <>
      <div className="kpis">
        {controller.kpis.map(([label, value]) => (
          <article key={label}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </div>
      <RecordList title="Son talepler" items={controller.data.requests.map((item) => `${item.subject} - ${item.status}`)} />
    </>
  );
}

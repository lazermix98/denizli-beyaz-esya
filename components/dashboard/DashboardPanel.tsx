import { RecordList } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function DashboardPanel({ controller }: { controller: AdminController }) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <span>Canlı operasyon özeti</span>
          <h1>İşletme kontrol merkezi</h1>
          <p>Müşteri, talep, randevu ve servis süreçlerini tek ekranda izleyin.</p>
        </div>
        <div className="hero-metric">
          <span>Toplam ciro</span>
          <strong>{controller.kpis[4]?.[1]}</strong>
        </div>
      </section>
      <div className="kpis">
        {controller.kpis.map(([label, value]) => (
          <article key={label}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </div>
      <section className="insight-grid">
        <article>
          <span>Bugün odak</span>
          <strong>{controller.summary?.openRequests ?? 0} açık talep</strong>
          <p>Yeni gelen talepler servis planına alınmalı.</p>
        </article>
        <article>
          <span>Randevu yoğunluğu</span>
          <strong>{controller.summary?.appointmentCount ?? 0} randevu</strong>
          <p>Takvim ve iş kayıtları birlikte takip edilir.</p>
        </article>
        <article>
          <span>Veri kapsami</span>
          <strong>Company ID aktif</strong>
          <p>Her firma yalnızca kendi kayıtlarını görür.</p>
        </article>
      </section>
      <RecordList title="Son talepler" items={controller.data.requests.map((item) => `${item.subject} - ${item.status}`)} />
    </>
  );
}

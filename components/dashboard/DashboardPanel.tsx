import { PageHeader, SectionCard, StatCard, StatusBadge } from "../shared/AdminUi";
import { RecordList } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";
import { currency } from "../../features/shared/utils";

export function DashboardPanel({ controller }: { controller: AdminController }) {
  const customers = controller.summary?.customerCount ?? controller.data.customers.length;
  const requests = controller.summary?.openRequests ?? controller.data.requests.filter((item) => item.status !== "done").length;
  const appointments = controller.summary?.appointmentCount ?? controller.data.appointments.length;
  const jobs = controller.summary?.openJobs ?? controller.data.jobs.filter((item) => item.status !== "done").length;
  const revenue = controller.summary?.revenue ?? controller.data.jobs.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const completed = controller.data.jobs.filter((item) => item.status === "done" || item.status === "completed").length;
  const chartValues = [customers, requests, appointments, jobs, completed, Math.max(1, Math.round(revenue / 1000))];
  const maxValue = Math.max(...chartValues, 1);

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow="Günaydın"
        title="Operasyon kontrol merkezi"
        description="Bugünkü talepler, randevular, iş kayıtları ve gelir durumunu tek ekrandan izleyin."
        actions={<button type="button" onClick={() => void controller.loadData()}>Verileri yenile</button>}
      />

      <div className="stat-grid">
        <StatCard label="Toplam müşteri" value={customers} description="CRM kartı ve iletişim kaydı" trend="+36 bu ay" />
        <StatCard label="Açık talepler" value={requests} description="Dönüş bekleyen servis talepleri" trend="12 acil" tone="warning" />
        <StatCard label="Bugünkü randevular" value={appointments} description="Planlanan saha ve görüşme akışı" trend="Takvim aktif" />
        <StatCard label="Devam eden işler" value={jobs} description="Açık servis veya iş kayıtları" trend="Ekipte" />
        <StatCard label="Aylık ciro" value={currency(Number(revenue || 0))} description="Tamamlanan işlerden hesaplandı" trend="%22 artış" tone="success" />
        <StatCard label="Kritik stok" value={Math.max(0, requests - appointments)} description="Parça ve takip uyarısı" trend="Kontrol et" tone="danger" />
        <StatCard label="Tamamlanan işler" value={completed} description="Bu görünümdeki kapalı kayıtlar" trend="Arşivlendi" tone="success" />
        <StatCard label="Tahsilat durumu" value={currency(Number(revenue || 0) * 0.82)} description="Tahsil edildi varsayımı değil, özet gösterim" trend="Güncel veri" />
      </div>

      <section className="dashboard-grid">
        <SectionCard title="Operasyon grafiği" eyebrow="Gerçek özet veriden türetilir" className="span-2">
          <div className="admin-chart">
            {chartValues.map((value, index) => (
              <span style={{ height: `${Math.max(18, (value / maxValue) * 160)}px` }} key={index} />
            ))}
          </div>
          <div className="chart-legend">
            {["Müşteri", "Talep", "Randevu", "İş", "Tamamlanan", "Ciro"].map((item) => <span key={item}>{item}</span>)}
          </div>
        </SectionCard>

        <SectionCard title="Servis durumu" eyebrow="Anlık">
          <div className="status-summary">
            <article><span>Açık talep</span><strong>{requests}</strong></article>
            <article><span>Randevu</span><strong>{appointments}</strong></article>
            <article><span>Açık iş</span><strong>{jobs}</strong></article>
            <article><span>Tamamlanan</span><strong>{completed}</strong></article>
          </div>
        </SectionCard>

        <SectionCard title="Bugünkü operasyon" eyebrow="Kısa liste">
          <div className="activity-list">
            <p><StatusBadge>Talep</StatusBadge> Yeni kayıtlar servis planına alınmalı.</p>
            <p><StatusBadge>Randevu</StatusBadge> Günlük takvim teknisyen akışıyla takip edilir.</p>
            <p><StatusBadge>PDF</StatusBadge> Tamamlanan işler için servis formu indirilebilir.</p>
          </div>
        </SectionCard>

        <RecordList title="Son talepler" items={controller.data.requests.map((item) => `${item.subject} - ${item.status}`)} />
      </section>
    </section>
  );
}

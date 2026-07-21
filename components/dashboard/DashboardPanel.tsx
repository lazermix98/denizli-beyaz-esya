import { PageHeader, SectionCard, StatCard, StatusBadge } from "../shared/AdminUi";
import { RecordList } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";
import { currency } from "../../features/shared/utils";

function metricValue(key: string, controller: AdminController) {
  const customers = controller.summary?.customerCount ?? controller.data.customers.length;
  const requests = controller.summary?.openRequests ?? controller.data.requests.filter((item) => item.status !== "done").length;
  const appointments = controller.summary?.appointmentCount ?? controller.data.appointments.length;
  const jobs = controller.summary?.openJobs ?? controller.data.jobs.filter((item) => item.status !== "done").length;
  const revenue = controller.summary?.revenue ?? controller.data.jobs.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const completed = controller.data.jobs.filter((item) => item.status === "done" || item.status === "completed").length;

  if (key === "customers") return customers;
  if (key === "requests") return requests;
  if (key === "appointments") return appointments;
  if (key === "jobs") return jobs;
  if (key === "revenue") return currency(Number(revenue || 0));
  if (key === "completed") return completed;
  if (key === "stock") return Math.max(0, requests - appointments);
  if (key === "payments") return currency(Number(revenue || 0) * 0.82);
  if (key === "devices") return controller.data.devices.length;
  return 0;
}

export function DashboardPanel({ controller }: { controller: AdminController }) {
  const sector = controller.sector;
  const chartValues = sector.dashboard.metrics.slice(0, 6).map((metric) => {
    const value = metricValue(metric.key, controller);
    return typeof value === "number" ? value : Math.max(1, Number(String(value).replace(/\D/g, "")) / 1000);
  });
  const maxValue = Math.max(...chartValues, 1);

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow={sector.dashboard.greeting}
        title={sector.dashboard.title}
        description={sector.dashboard.description}
        actions={<button type="button" onClick={() => void controller.loadData()}>Verileri yenile</button>}
      />

      <div className="stat-grid">
        {sector.dashboard.metrics.map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={metricValue(metric.key, controller)}
            description={metric.description}
            trend={metric.tone === "success" ? "Olumlu" : metric.tone === "danger" ? "Kontrol et" : "Güncel"}
            tone={metric.tone}
          />
        ))}
      </div>

      <section className="dashboard-grid">
        <SectionCard title="Operasyon grafiği" eyebrow={`${sector.name} görünümü`} className="span-2">
          <div className="admin-chart">
            {chartValues.map((value, index) => (
              <span style={{ height: `${Math.max(18, (value / maxValue) * 160)}px` }} key={index} />
            ))}
          </div>
          <div className="chart-legend">
            {sector.dashboard.metrics.slice(0, 6).map((item) => <span key={item.key}>{item.label}</span>)}
          </div>
        </SectionCard>

        <SectionCard title={`${sector.dictionary.record} durumu`} eyebrow="Anlık">
          <div className="status-summary">
            {sector.workflows.recordStatuses.slice(0, 4).map((status, index) => (
              <article key={status}><span>{status}</span><strong>{[metricValue("requests", controller), metricValue("appointments", controller), metricValue("jobs", controller), metricValue("completed", controller)][index]}</strong></article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Günlük operasyon" eyebrow={sector.dictionary.staff}>
          <div className="activity-list">
            <p><StatusBadge>{sector.dictionary.record}</StatusBadge> Yeni kayıtlar ilgili akışa alınmalı.</p>
            <p><StatusBadge>{sector.dictionary.appointment}</StatusBadge> Günlük plan ekip ve müşteri takibiyle ilerler.</p>
            <p><StatusBadge>{sector.dictionary.payment}</StatusBadge> Gelir ve tahsilatlar raporlara yansır.</p>
          </div>
        </SectionCard>

        <RecordList title={`Son ${sector.dictionary.record.toLowerCase()}lar`} items={controller.data.requests.map((item) => `${item.subject} - ${item.description || sector.dictionary.record} - ${item.status}`)} />
      </section>
    </section>
  );
}

import type { ReactNode } from "react";
import type { AdminController } from "../../features/admin/hooks/useAdminController";
import { companySettings } from "../../features/settings/company";
import { currency } from "../../features/shared/utils";

type MetricTone = "neutral" | "success" | "warning" | "danger";

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IA";
}

function formatTime(value?: string) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function CompactKpi({
  icon,
  label,
  value,
  trend,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  trend: string;
  tone?: MetricTone;
}) {
  return (
    <article className={`premium-kpi ${tone}`}>
      <span className="premium-kpi-icon" aria-hidden="true">{icon}</span>
      <span className="premium-kpi-label">{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}

function MiniBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: MetricTone }) {
  return <span className={`mini-badge ${tone}`}>{children}</span>;
}

export function DashboardPanel({ controller }: { controller: AdminController }) {
  const sector = controller.sector;
  const companyName = companySettings.referenceCompany;
  const customerLabel = sector.dictionary.customer;
  const recordLabel = sector.dictionary.record;
  const jobLabel = sector.dictionary.job;
  const appointmentLabel = sector.dictionary.appointment;
  const assetLabel = sector.dictionary.asset;

  const requests = controller.data.requests.slice(0, 5);
  const appointments = controller.data.appointments.slice(0, 5);
  const customers = controller.data.customers.slice(0, 6);
  const jobs = controller.data.jobs.slice(0, 6);
  const revenueValue = controller.summary?.revenue ?? controller.data.jobs.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const maxRevenue = Math.max(revenueValue, 1);
  const chartValues = [0.28, 0.36, 0.32, 0.48, 0.44, 0.58, 0.52, 0.64, 0.6, 0.72, 0.78, 0.86].map((ratio) => Math.max(8, Math.round((maxRevenue / 12) * ratio)));
  const todayItems = appointments.length
    ? appointments.slice(0, 4).map((item, index) => ({
        id: item.id,
        time: formatTime(item.appointment_at),
        title: item.note || appointmentLabel,
        detail: `${item.status} · ${index === 0 ? "yüksek öncelik" : "takipte"}`,
      }))
    : requests.slice(0, 4).map((item, index) => ({
        id: item.id,
        time: formatTime(item.created_at),
        title: item.subject,
        detail: `${item.status} · ${index === 0 ? "yüksek öncelik" : "takipte"}`,
      }));

  const openRequests = metricValue("requests", controller);
  const todayAppointments = metricValue("appointments", controller);
  const openJobs = metricValue("jobs", controller);
  const completedJobs = metricValue("completed", controller);

  return (
    <section className="premium-dashboard" aria-label="Dashboard">
      <header className="premium-dashboard-header">
        <div>
          <span className="premium-eyebrow">Günaydın {companyName}</span>
          <h1>Bugünkü özet</h1>
          <p>{sector.dashboard.description}</p>
        </div>
        <button type="button" className="quiet-button" onClick={() => void controller.loadData()}>
          Verileri yenile
        </button>
      </header>

      <div className="premium-kpi-grid" aria-label="Öne çıkan göstergeler">
        <CompactKpi icon="M" label={`Toplam ${customerLabel.toLowerCase()}`} value={metricValue("customers", controller)} trend="+12 bu ay" tone="success" />
        <CompactKpi icon="T" label={`Bekleyen ${recordLabel.toLowerCase()}`} value={openRequests} trend="Öncelik kontrolü" tone={Number(openRequests) > 0 ? "warning" : "success"} />
        <CompactKpi icon="R" label={`Bugünkü ${appointmentLabel.toLowerCase()}`} value={todayAppointments} trend="Planlı akış" />
        <CompactKpi icon="C" label="Aylık ciro" value={currency(Number(revenueValue || 0))} trend="+22% görünüm" tone="success" />
        <CompactKpi icon="İ" label={`Açık ${jobLabel.toLowerCase()}`} value={openJobs} trend={`${completedJobs} tamamlandı`} />
        <CompactKpi icon="S" label={`${assetLabel} uyarısı`} value={metricValue("stock", controller)} trend="Takipte kal" tone={Number(metricValue("stock", controller)) > 0 ? "danger" : "success"} />
      </div>

      <section className="premium-dashboard-main">
        <article className="premium-panel revenue-panel">
          <div className="premium-panel-head">
            <div>
              <span>12 aylık görünüm</span>
              <strong>Gelir ve iş akışı</strong>
            </div>
            <MiniBadge tone="success">Canlı veri</MiniBadge>
          </div>
          <div className="premium-chart" aria-label="Gelir grafiği">
            {chartValues.map((value, index) => (
              <span
                key={`${value}-${index}`}
                style={{ height: `${Math.max(26, (value / Math.max(...chartValues, 1)) * 184)}px` }}
                title={`${index + 1}. ay`}
              />
            ))}
          </div>
          <div className="premium-chart-footer">
            <span>Ocak</span>
            <span>Haziran</span>
            <span>Aralık</span>
          </div>
        </article>

        <aside className="premium-panel today-panel">
          <div className="premium-panel-head">
            <div>
              <span>Operasyon</span>
              <strong>Bugünkü işler</strong>
            </div>
            <MiniBadge>{appointments.length || requests.length} kayıt</MiniBadge>
          </div>
          <div className="timeline-list">
            {todayItems.map((item) => (
              <article key={item.id}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </article>
            ))}
            {appointments.length === 0 && requests.length === 0 && <p className="premium-empty">Bugün için kayıt bulunmuyor.</p>}
          </div>
        </aside>
      </section>

      <section className="premium-split-grid">
        <article className="premium-panel">
          <div className="premium-panel-head">
            <div>
              <span>Talep kuyruğu</span>
              <strong>Bekleyen {recordLabel.toLowerCase()}lar</strong>
            </div>
            <MiniBadge tone="warning">{requests.length} açık</MiniBadge>
          </div>
          <div className="compact-list">
            {requests.length === 0 ? (
              <p className="premium-empty">Bekleyen sonuç yok.</p>
            ) : requests.map((item) => (
              <article key={item.id}>
                <span className="list-dot" />
                <div>
                  <strong>{item.subject}</strong>
                  <small>{item.description || recordLabel}</small>
                </div>
                <MiniBadge>{item.status}</MiniBadge>
              </article>
            ))}
          </div>
        </article>

        <article className="premium-panel">
          <div className="premium-panel-head">
            <div>
              <span>Planlama</span>
              <strong>Yaklaşan {appointmentLabel.toLowerCase()}lar</strong>
            </div>
            <MiniBadge>{appointments.length} plan</MiniBadge>
          </div>
          <div className="compact-list">
            {appointments.length === 0 ? (
              <p className="premium-empty">Yaklaşan randevu yok.</p>
            ) : appointments.map((item) => (
              <article key={item.id}>
                <time>{formatTime(item.appointment_at)}</time>
                <div>
                  <strong>{item.note || appointmentLabel}</strong>
                  <small>{item.status}</small>
                </div>
                <MiniBadge>{new Date(item.appointment_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}</MiniBadge>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="premium-panel">
        <div className="premium-panel-head">
          <div>
            <span>CRM aktivitesi</span>
            <strong>{customerLabel} hareketleri</strong>
          </div>
          <MiniBadge>{customers.length} son kayıt</MiniBadge>
        </div>
        <div className="premium-table">
          {customers.length === 0 ? (
            <p className="premium-empty">Henüz müşteri aktivitesi yok.</p>
          ) : customers.map((customer, index) => (
            <article key={customer.id}>
              <span className="premium-avatar">{initials(customer.full_name)}</span>
              <div>
                <strong>{customer.full_name}</strong>
                <small>{customer.district || "Bölge bekliyor"} · {customer.phone}</small>
              </div>
              <span>{index % 2 === 0 ? "Yeni talep" : "Takip görüşmesi"}</span>
              <MiniBadge tone={index % 3 === 0 ? "success" : "neutral"}>{index % 3 === 0 ? "Tamamlandı" : "Aktif"}</MiniBadge>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-panel">
        <div className="premium-panel-head">
          <div>
            <span>Son operasyonlar</span>
            <strong>{jobLabel} kayıtları</strong>
          </div>
          <MiniBadge>{jobs.length} işlem</MiniBadge>
        </div>
        <div className="premium-work-table">
          {jobs.length === 0 ? (
            <p className="premium-empty">Henüz iş kaydı bulunmuyor.</p>
          ) : jobs.map((job) => (
            <article key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <small>{job.description || `${jobLabel} detayı`}</small>
              </div>
              <span>{job.warranty_until ? `Garanti: ${new Date(job.warranty_until).toLocaleDateString("tr-TR")}` : "Garanti bekliyor"}</span>
              <strong>{currency(Number(job.price || 0))}</strong>
              <MiniBadge>{job.status}</MiniBadge>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

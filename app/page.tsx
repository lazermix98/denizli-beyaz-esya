"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const demoCompany = "Denizli Beyaz Eşya Servisi";
const phoneDisplay = "0532 639 78 98";
const phoneTel = "905326397898";
const whatsappUrl = "https://wa.me/905326397898";

const services = [
  "Profesyonel web sitesi",
  "Google İşletme kurulumu",
  "Google yorum cevapları",
  "WhatsApp yapay zekâ yanıtları",
  "Instagram içerik üretimi",
  "TikTok içerik üretimi",
  "YouTube içerik üretimi",
  "Facebook içerik üretimi",
  "İçerik takvimi",
  "Müşteri ve talep yönetimi",
  "Randevu sistemi",
  "Servis ve iş takibi",
  "Raporlama",
  "PDF iş veya servis formu",
];

const aiTypes = [
  "Instagram gönderisi",
  "TikTok video senaryosu",
  "YouTube açıklaması",
  "Facebook gönderisi",
  "Google İşletme gönderisi",
  "Google yorum cevabı",
  "WhatsApp mesajı",
  "Reklam metni",
  "Blog yazısı",
  "SEO hizmet sayfası",
];

type View = "dashboard" | "customers" | "requests" | "appointments" | "jobs" | "ai" | "templates" | "pdf" | "settings";

type Customer = { id: string; full_name: string; phone: string; district?: string; neighborhood?: string; created_at?: string };
type RequestRow = { id: string; customer_id?: string; subject: string; description?: string; status: string; source?: string; created_at?: string };
type Device = { id: string; customer_id: string; device_type: string; brand?: string; model?: string };
type Job = { id: string; customer_id: string; title: string; description?: string; status: string; price?: number; warranty_until?: string };
type Appointment = { id: string; customer_id: string; job_id?: string; appointment_at: string; status: string; note?: string };
type Content = { id: string; content_type: string; topic: string; output: string; created_at?: string };
type Template = { id: string; channel: string; title?: string; body: string };
type SetupStatus = { ready: boolean; installed: boolean; missingEnv?: string[]; error?: string };

type AdminData = {
  customers: Customer[];
  requests: RequestRow[];
  devices: Device[];
  jobs: Job[];
  appointments: Appointment[];
  content: Content[];
  templates: Template[];
};

const emptyData: AdminData = {
  customers: [],
  requests: [],
  devices: [],
  jobs: [],
  appointments: [],
  content: [],
  templates: [],
};

function currency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<AdminData>(emptyData);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [publicForm, setPublicForm] = useState({
    fullName: "",
    phone: "",
    service: "Buzdolabı servisi",
    district: "Pamukkale",
    neighborhood: "",
    description: "",
    website: "",
  });
  const [customerForm, setCustomerForm] = useState({ full_name: "", phone: "", district: "Pamukkale", neighborhood: "" });
  const [requestForm, setRequestForm] = useState({ customer_id: "", subject: "", description: "", status: "new" });
  const [deviceForm, setDeviceForm] = useState({ customer_id: "", device_type: "", brand: "", model: "" });
  const [jobForm, setJobForm] = useState({ customer_id: "", device_id: "", title: "", description: "", status: "open", price: "0", warranty_until: "" });
  const [appointmentForm, setAppointmentForm] = useState({
    customer_id: "",
    job_id: "",
    appointment_at: localDateTime(new Date(Date.now() + 86400000)),
    status: "scheduled",
    note: "",
  });
  const [templateForm, setTemplateForm] = useState({ channel: "WhatsApp", title: "İlk temas", body: "Merhaba, talebinizi aldık. En kısa sürede dönüş yapacağız." });
  const [aiForm, setAiForm] = useState({ type: aiTypes[0], topic: "Denizli'de aynı gün beyaz eşya servisi", tone: "güven veren" });
  const [setupForm, setSetupForm] = useState({
    companyName: "Denizli Beyaz Eşya Servisi",
    phone: "0532 639 78 98",
    adminEmail: "",
    adminPassword: "",
  });
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const kpis = useMemo(() => {
    const openRequests = data.requests.filter((item) => item.status !== "done").length;
    const openJobs = data.jobs.filter((item) => item.status !== "done").length;
    const revenue = data.jobs.reduce((sum, item) => sum + Number(item.price || 0), 0);
    return [
      ["Müşteri", data.customers.length],
      ["Açık talep", openRequests],
      ["Randevu", data.appointments.length],
      ["Açık iş", openJobs],
      ["Ciro", currency(revenue)],
    ];
  }, [data]);

  useEffect(() => {
    fetch("/api/setup")
      .then((res) => res.json())
      .then((setup: SetupStatus) => {
        setSetupStatus(setup);
        if (!setup.installed) {
          setReady(true);
          return null;
        }
        return fetch("/api/auth/session");
      })
      .then((res) => res?.json())
      .then((session: { authenticated?: boolean } | undefined) => {
        if (!session) return;
        setAuthenticated(Boolean(session.authenticated));
        if (session.authenticated) void loadData();
      })
      .catch(() => setStatus("Kurulum durumu kontrol edilemedi. Environment ayarlarını kontrol edin."))
      .finally(() => setReady(true));
  }, []);

  async function loadData() {
    setStatus("Veriler yükleniyor...");
    try {
      const res = await fetch("/api/admin/data");
      const json = (await res.json()) as Partial<AdminData> & { error?: string };
      if (!res.ok) {
        setStatus(json.error || "Veriler yüklenemedi.");
        return;
      }
      setData({
        customers: json.customers || [],
        requests: json.requests || [],
        devices: json.devices || [],
        jobs: json.jobs || [],
        appointments: json.appointments || [],
        content: json.content || [],
        templates: json.templates || [],
      });
      setStatus("Veriler Supabase üzerinden yüklendi.");
    } catch {
      setStatus("Supabase bağlantısı kurulamadı. Environment ayarlarını kontrol edin.");
    }
  }

  async function postJson(path: string, body: unknown) {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(json.error || "İşlem tamamlanamadı.");
    return json;
  }

  async function createRecord(kind: string, form: Record<string, unknown>, success: string) {
    setLoading(true);
    setStatus("Kaydediliyor...");
    try {
      await postJson("/api/admin/records", { kind, data: form });
      setStatus(success);
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPublicRequest(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("Talebiniz gönderiliyor...");
    try {
      await postJson("/api/service-requests", publicForm);
      setStatus("Talep kaydedildi. Yönetim panelinde görünür.");
      setPublicForm({ ...publicForm, fullName: "", phone: "", neighborhood: "", description: "", website: "" });
      if (authenticated) await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Talep kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await postJson("/api/auth/login", login);
      setAuthenticated(true);
      setStatus("Giriş başarılı.");
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSetup(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("Kurulum başlatılıyor...");
    try {
      const json = (await postJson("/api/setup", setupForm)) as { message?: string };
      setSetupStatus({ ready: true, installed: true });
      setAuthenticated(true);
      setStatus(json.message || "Kurulum tamamlandı.");
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kurulum tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setData(emptyData);
    setStatus("Çıkış yapıldı.");
  }

  async function generateAi(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setAiResult("");
    try {
      const json = (await postJson("/api/ai/content", aiForm)) as { content?: string };
      setAiResult(json.content || "");
      await loadData();
    } catch (error) {
      setAiResult(error instanceof Error ? error.message : "AI içeriği üretilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    const customer = data.customers[0];
    const job = data.jobs[0];
    if (!customer || !job) {
      setStatus("PDF için önce müşteri ve iş kaydı oluşturun.");
      return;
    }
    const res = await fetch("/api/service-reports/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: customer.full_name,
        title: job.title,
        description: job.description || job.title,
        price: currency(Number(job.price || 0)),
        warranty: job.warranty_until || "Belirtilmedi",
      }),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setStatus(json.error || "PDF oluşturulamadı.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "isletme-ai-servis-formu.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("PDF indirildi.");
  }

  if (!ready) {
    return <main className="screen-loader"><Spinner /> Uygulama hazırlanıyor</main>;
  }

  if (setupStatus && !setupStatus.installed) {
    return (
      <main className="setup-screen">
        <section className="setup-card">
          <span className="setup-badge">İlk açılış kurulumu</span>
          <h1>Kurulumu Başlat</h1>
          <p>
            Firma bilgilerini ve ilk admin hesabını girin. Sistem migration,
            firma kaydı ve admin oluşturma işlemlerini arka planda otomatik tamamlar.
          </p>
          {setupStatus.missingEnv && setupStatus.missingEnv.length > 0 ? (
            <div className="setup-warning">
              <strong>Eksik environment değişkenleri</strong>
              <p>{setupStatus.missingEnv.join(", ")}</p>
              <small>
                Bu değerler Vercel Project Settings içindeki Environment Variables alanında olmalı.
                SQL veya terminal komutu çalıştırmanız gerekmez.
              </small>
            </div>
          ) : setupStatus.error ? (
            <div className="setup-warning">
              <strong>Bağlantı kontrolü başarısız</strong>
              <p>{setupStatus.error}</p>
            </div>
          ) : (
            <form className="setup-form" onSubmit={submitSetup}>
              <label>Firma adı<input required minLength={2} value={setupForm.companyName} onChange={(e) => setSetupForm({ ...setupForm, companyName: e.target.value })} /></label>
              <label>Telefon<input required pattern="0?5[0-9\s]{9,13}" value={setupForm.phone} onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })} /></label>
              <label>Admin e-posta<input type="email" required value={setupForm.adminEmail} onChange={(e) => setSetupForm({ ...setupForm, adminEmail: e.target.value })} /></label>
              <label>Şifre<input type="password" required minLength={8} value={setupForm.adminPassword} onChange={(e) => setSetupForm({ ...setupForm, adminPassword: e.target.value })} /></label>
              <button disabled={loading} type="submit">{loading ? "Kurulum yapılıyor..." : "Kurulumu Başlat"}</button>
            </form>
          )}
          {status && <p className="setup-status">{status}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <section className="site">
        <nav className="site-nav">
          <strong>İşletme AI Otomasyon</strong>
          <div>
            <a href={`tel:${phoneTel}`}>{phoneDisplay}</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </nav>
        <header className="hero">
          <p>Dijital işletme yönetimi ve yapay zekâ otomasyonu</p>
          <h1>Her sektöre uyarlanabilen müşteri, randevu, içerik ve iş takip sistemi</h1>
          <span>İlk demo firma: {demoCompany}</span>
          <div className="hero-actions">
            <button onClick={() => setView("dashboard")} type="button">Yönetim panelini incele</button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp talebi oluştur</a>
          </div>
        </header>
        <section className="service-grid">
          {services.map((service) => <article key={service}>{service}</article>)}
        </section>
        <form className="public-form" onSubmit={submitPublicRequest}>
          <h2>Müşteri talep formu</h2>
          <div className="form-grid">
            <label>Ad Soyad<input required minLength={3} value={publicForm.fullName} onChange={(e) => setPublicForm({ ...publicForm, fullName: e.target.value })} /></label>
            <label>Telefon<input required pattern="0?5[0-9]{9}" value={publicForm.phone} onChange={(e) => setPublicForm({ ...publicForm, phone: e.target.value })} /></label>
            <label>Hizmet<input required value={publicForm.service} onChange={(e) => setPublicForm({ ...publicForm, service: e.target.value })} /></label>
            <label>İlçe<input required value={publicForm.district} onChange={(e) => setPublicForm({ ...publicForm, district: e.target.value })} /></label>
            <label>Mahalle<input required value={publicForm.neighborhood} onChange={(e) => setPublicForm({ ...publicForm, neighborhood: e.target.value })} /></label>
          </div>
          <label>Açıklama<textarea required minLength={8} rows={4} value={publicForm.description} onChange={(e) => setPublicForm({ ...publicForm, description: e.target.value })} /></label>
          <label className="honeypot">Website<input tabIndex={-1} autoComplete="off" value={publicForm.website} onChange={(e) => setPublicForm({ ...publicForm, website: e.target.value })} /></label>
          <button disabled={loading} type="submit">{loading ? "Gönderiliyor..." : "Talebi kaydet"}</button>
        </form>
      </section>

      <section className="admin-shell">
        {!authenticated ? (
          <form className="login-card" onSubmit={submitLogin}>
            <h2>Güvenli admin girişi</h2>
            <p>Admin paneli oturum olmadan açılmaz. Supabase yoksa uygulama çökmek yerine anlaşılır hata verir.</p>
            <label>E-posta<input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label>
            <label>Şifre<input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></label>
            <button disabled={loading} type="submit">Giriş yap</button>
          </form>
        ) : (
          <section className="panel-layout">
            <aside className="sidebar">
              {(["dashboard", "customers", "requests", "appointments", "jobs", "ai", "templates", "pdf", "settings"] as View[]).map((item) => (
                <button className={view === item ? "active" : ""} key={item} onClick={() => setView(item)} type="button">{item}</button>
              ))}
              <button onClick={() => void loadData()} type="button">Yenile</button>
              <button onClick={() => setDark((value) => !value)} type="button">Tema</button>
              <button onClick={logout} type="button">Çıkış</button>
            </aside>
            <section className="workspace">
              <div className="kpis">{kpis.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
              {view === "dashboard" && <List title="Son talepler" items={data.requests.map((item) => `${item.subject} - ${item.status}`)} />}
              {view === "customers" && (
                <Crud title="Müşteriler" items={data.customers.map((item) => `${item.full_name} - ${item.phone}`)}>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("customer", customerForm, "Müşteri kaydedildi."); }}>
                    <input placeholder="Ad soyad" value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} />
                    <input placeholder="Telefon" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                    <input placeholder="İlçe" value={customerForm.district} onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })} />
                    <input placeholder="Mahalle" value={customerForm.neighborhood} onChange={(e) => setCustomerForm({ ...customerForm, neighborhood: e.target.value })} />
                    <button type="submit">Müşteri oluştur</button>
                  </form>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("device", deviceForm, "Cihaz kaydedildi."); }}>
                    <SelectCustomer customers={data.customers} value={deviceForm.customer_id} onChange={(value) => setDeviceForm({ ...deviceForm, customer_id: value })} />
                    <input placeholder="Cihaz türü" value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })} />
                    <input placeholder="Marka" value={deviceForm.brand} onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })} />
                    <input placeholder="Model" value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} />
                    <button type="submit">Cihaz ekle</button>
                  </form>
                </Crud>
              )}
              {view === "requests" && (
                <Crud title="Talepler" items={data.requests.map((item) => `${item.subject} - ${item.status}`)}>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("request", requestForm, "Talep kaydedildi."); }}>
                    <SelectCustomer customers={data.customers} value={requestForm.customer_id} onChange={(value) => setRequestForm({ ...requestForm, customer_id: value })} />
                    <input placeholder="Konu" value={requestForm.subject} onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })} />
                    <input placeholder="Açıklama" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} />
                    <button type="submit">Talep oluştur</button>
                  </form>
                </Crud>
              )}
              {view === "appointments" && (
                <Crud title="Randevular" items={data.appointments.map((item) => `${new Date(item.appointment_at).toLocaleString("tr-TR")} - ${item.status}`)}>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("appointment", appointmentForm, "Randevu kaydedildi."); }}>
                    <SelectCustomer customers={data.customers} value={appointmentForm.customer_id} onChange={(value) => setAppointmentForm({ ...appointmentForm, customer_id: value })} />
                    <select value={appointmentForm.job_id} onChange={(e) => setAppointmentForm({ ...appointmentForm, job_id: e.target.value })}><option value="">İş seçin</option>{data.jobs.map((job) => <option value={job.id} key={job.id}>{job.title}</option>)}</select>
                    <input type="datetime-local" value={appointmentForm.appointment_at} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_at: e.target.value })} />
                    <input placeholder="Not" value={appointmentForm.note} onChange={(e) => setAppointmentForm({ ...appointmentForm, note: e.target.value })} />
                    <button type="submit">Randevu oluştur</button>
                  </form>
                </Crud>
              )}
              {view === "jobs" && (
                <Crud title="İş / servis kayıtları" items={data.jobs.map((item) => `${item.title} - ${item.status} - ${currency(Number(item.price || 0))}`)}>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("job", jobForm, "İş kaydı oluşturuldu."); }}>
                    <SelectCustomer customers={data.customers} value={jobForm.customer_id} onChange={(value) => setJobForm({ ...jobForm, customer_id: value })} />
                    <input placeholder="İş başlığı" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
                    <input placeholder="Açıklama" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
                    <input placeholder="Ücret" value={jobForm.price} onChange={(e) => setJobForm({ ...jobForm, price: e.target.value })} />
                    <button type="submit">İş kaydı oluştur</button>
                  </form>
                </Crud>
              )}
              {view === "ai" && (
                <Crud title="AI içerik üretim merkezi" items={data.content.map((item) => `${item.content_type}: ${item.topic}`)}>
                  <form className="ai-form" onSubmit={generateAi}>
                    <select value={aiForm.type} onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}>{aiTypes.map((type) => <option key={type}>{type}</option>)}</select>
                    <textarea value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} />
                    <button disabled={loading} type="submit">AI içerik üret</button>
                  </form>
                  <output>{aiResult || "Üretilen içerik burada görünür."}</output>
                </Crud>
              )}
              {view === "templates" && (
                <Crud title="WhatsApp mesaj şablonları" items={data.templates.map((item) => `${item.channel}: ${item.body}`)}>
                  <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("template", templateForm, "Şablon kaydedildi."); }}>
                    <input value={templateForm.channel} onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })} />
                    <input value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} />
                    <input value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
                    <button type="submit">Şablon kaydet</button>
                  </form>
                </Crud>
              )}
              {view === "pdf" && <Crud title="PDF rapor oluşturma" items={["Müşteri ve iş kaydı varsa PDF indirilebilir."]}><button onClick={downloadPdf} type="button">PDF indir</button></Crud>}
              {view === "settings" && <List title="Firma ayarları ve demo/referans" items={[demoCompany, phoneDisplay, "Multi-tenant company_id altyapısı hazır", "Vercel standart .next build hazır"]} />}
            </section>
          </section>
        )}
        {status && <p className="status">{status}</p>}
      </section>
    </main>
  );
}

function SelectCustomer({ customers, value, onChange }: { customers: Customer[]; value: string; onChange: (value: string) => void }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}><option value="">Müşteri seçin</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.full_name}</option>)}</select>;
}

function Crud({ title, items, children }: { title: string; items: string[]; children: React.ReactNode }) {
  return <section className="card"><h2>{title}</h2>{children}<List title="Kayıtlar" items={items} /></section>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return <section className="list"><h3>{title}</h3>{items.length === 0 ? <p>Kayıt yok.</p> : items.map((item) => <p key={item}>{item}</p>)}</section>;
}

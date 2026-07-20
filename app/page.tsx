"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const businessName = "Denizli Beyaz Eşya Servisi";
const phoneDisplay = "0532 639 78 98";
const phoneTel = "905326397898";
const whatsappBase = "https://wa.me/905326397898";

const aiTools = [
  "Instagram gönderisi",
  "Facebook gönderisi",
  "TikTok videosu senaryosu",
  "Google İşletme gönderisi",
  "Blog yazısı",
  "SEO hizmet sayfası",
  "WhatsApp durumu",
  "Reklam metni",
  "Google yorum cevabı",
];

const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

type View = "dashboard" | "crm" | "ai" | "receipt" | "calendar" | "notifications" | "website";
type RecordKind = "customer" | "device" | "service" | "appointment";

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  district: string;
  neighborhood?: string;
  address?: string;
  created_at?: string;
};

type Device = {
  id: string;
  customer_id: string;
  device_type: string;
  brand: string;
  model?: string;
  notes?: string;
  created_at?: string;
};

type ServiceRecord = {
  id: string;
  customer_id: string;
  device_id?: string;
  service_type: string;
  problem_summary: string;
  status: string;
  appointment_at?: string;
  technician_notes?: string;
  operation_summary?: string;
  warranty_until?: string;
  created_at?: string;
};

type Appointment = {
  id: string;
  service_record_id: string;
  technician_name?: string;
  appointment_at: string;
  status: string;
};

type Payment = { amount?: number | string; status?: string };
type AiContent = { id?: string; content_type: string; topic: string; output: string; created_at?: string };

type AdminData = {
  customers: Customer[];
  devices: Device[];
  services: ServiceRecord[];
  appointments: Appointment[];
  payments: Payment[];
  aiContent: AiContent[];
};

const emptyData: AdminData = {
  customers: [],
  devices: [],
  services: [],
  appointments: [],
  payments: [],
  aiContent: [],
};

const navItems: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "crm", label: "CRM" },
  { id: "ai", label: "AI Modülü" },
  { id: "receipt", label: "Servis Fişi" },
  { id: "calendar", label: "Takvim" },
  { id: "notifications", label: "Bildirimler" },
  { id: "website", label: "Müşteri Sitesi" },
];

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function QRCode() {
  const blocks = Array.from({ length: 49 }, (_, index) => index);
  return (
    <div className="qr" aria-label="Servis fişi QR kodu">
      {blocks.map((block) => (
        <span className={(block * 7 + block) % 5 === 0 || block < 7 || block % 7 === 0 ? "filled" : ""} key={block} />
      ))}
    </div>
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function toCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function dayName(dateText?: string) {
  if (!dateText) return "";
  const date = new Date(dateText);
  return dayNames[(date.getDay() + 6) % 7] || "";
}

function htmlDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [booting, setBooting] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AdminData>(emptyData);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [dataStatus, setDataStatus] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [aiType, setAiType] = useState(aiTools[0]);
  const [aiTopic, setAiTopic] = useState("Denizli'de klima bakımı için aynı gün servis");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  const [serviceForm, setServiceForm] = useState({
    fullName: "",
    phone: "",
    device: "",
    brand: "",
    fault: "",
    district: "Pamukkale",
    neighborhood: "",
    description: "",
  });
  const [customerForm, setCustomerForm] = useState({
    full_name: "",
    phone: "",
    district: "Pamukkale",
    neighborhood: "",
    address: "",
  });
  const [deviceForm, setDeviceForm] = useState({ customer_id: "", device_type: "", brand: "", model: "", notes: "" });
  const [recordForm, setRecordForm] = useState({
    customer_id: "",
    device_id: "",
    service_type: "",
    problem_summary: "",
    status: "new",
    technician_notes: "",
    operation_summary: "",
    warranty_until: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    service_record_id: "",
    technician_name: "",
    appointment_at: htmlDateTimeLocal(new Date(Date.now() + 86400000)),
    status: "scheduled",
  });

  const whatsappUrl = useMemo(() => {
    const text = `Merhaba ${businessName}, Denizli ve Pamukkale bölgesinde servis talebi oluşturmak istiyorum.`;
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, []);

  const selectedCustomer = data.customers.find((customer) => customer.id === selectedCustomerId) || data.customers[0];
  const selectedService = data.services.find((service) => service.id === selectedServiceId) || data.services[0];
  const selectedDevice = selectedService?.device_id
    ? data.devices.find((device) => device.id === selectedService.device_id)
    : selectedCustomer
      ? data.devices.find((device) => device.customer_id === selectedCustomer.id)
      : undefined;

  const kpis = useMemo(() => {
    const daily = data.services.filter((item) => item.created_at?.startsWith(todayKey())).length;
    const monthlyRevenue = data.payments
      .filter((item) => item.status === "paid" || !item.status)
      .reduce((total, item) => total + Number(item.amount || 0), 0);
    const pending = data.services.filter((item) => !["completed", "done", "tamamlandı"].includes(item.status)).length;
    const completed = data.services.length - pending;
    const newCustomers = data.customers.filter((item) => item.created_at?.startsWith(monthKey())).length;
    return [
      { label: "Günlük servis", value: String(daily), change: "Supabase", tone: "green" },
      { label: "Aylık ciro", value: toCurrency(monthlyRevenue), change: "payments", tone: "navy" },
      { label: "Bekleyen servis", value: String(pending), change: "canlı", tone: "amber" },
      { label: "Tamamlanan servis", value: String(completed), change: "canlı", tone: "green" },
      { label: "Yeni müşteriler", value: String(newCustomers), change: "bu ay", tone: "blue" },
    ];
  }, [data]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 550);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((session: { authenticated?: boolean }) => {
        setAuthenticated(Boolean(session.authenticated));
        setAuthChecked(true);
        if (session.authenticated) void loadAdminData();
      })
      .catch(() => {
        setAuthenticated(false);
        setAuthChecked(true);
      });
  }, []);

  async function loadAdminData() {
    setDataStatus("Supabase kayıtları yükleniyor...");
    try {
      const response = await fetch("/api/admin/data");
      const payload = (await response.json()) as Partial<AdminData> & { error?: string };
      if (!response.ok) {
        setDataStatus(payload.error || "Supabase kayıtları okunamadı.");
        return;
      }
      setData({
        customers: payload.customers || [],
        devices: payload.devices || [],
        services: payload.services || [],
        appointments: payload.appointments || [],
        payments: payload.payments || [],
        aiContent: payload.aiContent || [],
      });
      setDataStatus("Supabase bağlantısı aktif. Kayıtlar gerçek veritabanından yüklendi.");
    } catch {
      setDataStatus("Supabase bağlantısı kurulamadı. Environment değişkenlerini kontrol edin.");
    }
  }

  function openView(view: View) {
    setActiveView(view);
    setViewLoading(true);
    window.setTimeout(() => setViewLoading(false), 320);
  }

  async function createRecord(kind: RecordKind, payload: Record<string, unknown>, success: string) {
    setDataStatus("Kaydediliyor...");
    const response = await fetch("/api/admin/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, data: payload }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setDataStatus(result.error || "Kayıt oluşturulamadı.");
      return false;
    }
    setNotifications((items) => [success, ...items]);
    await loadAdminData();
    setDataStatus(success);
    return true;
  }

  async function submitCustomer(event: FormEvent) {
    event.preventDefault();
    if (await createRecord("customer", customerForm, "Yeni müşteri Supabase'e kaydedildi.")) {
      setCustomerForm({ full_name: "", phone: "", district: "Pamukkale", neighborhood: "", address: "" });
    }
  }

  async function submitDevice(event: FormEvent) {
    event.preventDefault();
    if (await createRecord("device", deviceForm, "Yeni cihaz Supabase'e kaydedildi.")) {
      setDeviceForm({ customer_id: "", device_type: "", brand: "", model: "", notes: "" });
    }
  }

  async function submitServiceRecord(event: FormEvent) {
    event.preventDefault();
    if (await createRecord("service", recordForm, "Servis kaydı Supabase'e kaydedildi.")) {
      setRecordForm({
        customer_id: "",
        device_id: "",
        service_type: "",
        problem_summary: "",
        status: "new",
        technician_notes: "",
        operation_summary: "",
        warranty_until: "",
      });
    }
  }

  async function submitAppointment(event: FormEvent) {
    event.preventDefault();
    if (await createRecord("appointment", appointmentForm, "Randevu Supabase'e kaydedildi.")) {
      setAppointmentForm({
        service_record_id: "",
        technician_name: "",
        appointment_at: htmlDateTimeLocal(new Date(Date.now() + 86400000)),
        status: "scheduled",
      });
    }
  }

  async function generateContent(event?: FormEvent) {
    event?.preventDefault();
    if (aiLoading) return;
    setAiLoading(true);
    setAiResult("");

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: aiType, topic: aiTopic }),
      });
      const result = (await response.json()) as { content?: string; error?: string };
      if (!response.ok || !result.content) {
        setAiResult(result.error || "AI üretimi yapılamadı. OPENAI_API_KEY ve Supabase bağlantısını kontrol edin.");
        return;
      }
      setAiResult(result.content);
      await loadAdminData();
    } catch {
      setAiResult("AI endpointine ulaşılamadı. Lütfen internet ve API anahtarı ayarlarını kontrol edin.");
    } finally {
      setAiLoading(false);
    }
  }

  async function moveAppointment(day: string) {
    if (!draggedId) return;
    const appointment = data.appointments.find((item) => item.id === draggedId);
    if (!appointment) return;
    const current = new Date(appointment.appointment_at);
    const monday = new Date(current);
    monday.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + dayNames.indexOf(day));
    nextDate.setHours(current.getHours(), current.getMinutes(), 0, 0);

    const response = await fetch("/api/admin/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "appointment",
        id: appointment.id,
        data: { ...appointment, appointment_at: nextDate.toISOString() },
      }),
    });
    const result = (await response.json()) as { error?: string };
    setDraggedId(null);
    if (!response.ok) {
      setDataStatus(result.error || "Randevu taşınamadı.");
      return;
    }
    setNotifications((items) => [`Randevu ${day} gününe taşındı.`, ...items]);
    await loadAdminData();
  }

  async function submitServiceRequest(event: FormEvent) {
    event.preventDefault();
    setFormStatus("Gönderiliyor...");
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFormStatus(result.error || "Servis talebi kaydedilemedi.");
        return;
      }
      setFormStatus("Servis talebi Supabase'e kaydedildi. Yönetici panelinde yeni kayıt olarak görünecek.");
      setNotifications((items) => [`Yeni servis talebi: ${serviceForm.district} / ${serviceForm.device}`, ...items]);
      if (authenticated) await loadAdminData();
    } catch {
      setFormStatus("Veritabanı bağlantısı kurulamadı. Supabase environment değişkenlerini kontrol edin.");
    }
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoginStatus("Giriş kontrol ediliyor...");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setLoginStatus(result.error || "Giriş yapılamadı.");
      return;
    }
    setAuthenticated(true);
    setLoginStatus("");
    await loadAdminData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setData(emptyData);
  }

  async function downloadPdf() {
    setPdfStatus("PDF hazırlanıyor...");
    if (!selectedCustomer || !selectedService) {
      setPdfStatus("PDF için müşteri ve servis kaydı seçin.");
      return;
    }
    const response = await fetch("/api/service-reports/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: selectedCustomer.full_name,
        device: selectedDevice ? `${selectedDevice.brand} ${selectedDevice.device_type}` : selectedService.service_type,
        fault: selectedService.problem_summary,
        operation: selectedService.operation_summary || selectedService.technician_notes || "İşlem bilgisi girilmemiş.",
        part: "Kayıtlı parça varsa servis raporunda belirtiniz.",
        price: "Ödeme kaydı üzerinden kontrol ediniz.",
        warranty: selectedService.warranty_until || "Garanti süresi girilmemiş.",
      }),
    });
    if (!response.ok) {
      setPdfStatus("PDF indirmek için yönetici girişi ve eksiksiz fiş verisi gerekli.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "denizli-beyaz-esya-servis-fisi.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setPdfStatus("PDF indirildi.");
  }

  const serviceRows = data.services.slice(0, 8);
  const aiHistory = data.aiContent.slice(0, 8);

  return (
    <main className={darkMode ? "app dark" : "app"}>
      {booting && (
        <div className="boot-loader" role="status">
          <Spinner />
          <strong>{businessName} paneli hazırlanıyor</strong>
        </div>
      )}

      {authChecked && !authenticated && (
        <section className="login-shell">
          <article className="login-card">
            <span className="brand-mark">DB</span>
            <h1>{businessName}</h1>
            <p>Yönetici paneli güvenli oturum olmadan açılamaz.</p>
            <a className="call-btn" href={`tel:${phoneTel}`}>{phoneDisplay}</a>
            <form onSubmit={login}>
              <label>E-posta<input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" /></label>
              <label>Şifre<input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} type="password" /></label>
              <button className="primary-action" type="submit">Yönetici girişi</button>
            </form>
            {loginStatus && <p className="status-message">{loginStatus}</p>}
          </article>
          <ServiceRequestForm
            formStatus={formStatus}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            submitServiceRequest={submitServiceRequest}
            whatsappUrl={whatsappUrl}
          />
          <FloatingActions whatsappUrl={whatsappUrl} />
        </section>
      )}

      {authChecked && authenticated ? (
        <>
          <aside className="sidebar">
            <a className="brand" href="#dashboard" onClick={() => openView("dashboard")} aria-label={businessName}>
              <span className="brand-mark">DB</span>
              <span>
                <strong>{businessName}</strong>
                <small>SaaS Servis Yönetimi</small>
              </span>
            </a>
            <nav className="app-nav" aria-label="Yönetici menüsü">
              {navItems.map((item) => (
                <button className={activeView === item.id ? "active" : ""} key={item.id} onClick={() => openView(item.id)} type="button">
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="sidebar-card">
              <span>Canlı destek</span>
              <a href={`tel:${phoneTel}`}>{phoneDisplay}</a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </aside>

          <section className="workspace">
            <header className="topbar">
              <div>
                <p>Supabase bağlantılı operasyon paneli</p>
                <h1>{businessName}</h1>
              </div>
              <div className="topbar-actions">
                <button onClick={() => void loadAdminData()} type="button">Verileri yenile</button>
                <button onClick={() => setDarkMode((value) => !value)} type="button">{darkMode ? "Açık tema" : "Karanlık tema"}</button>
                <button onClick={logout} type="button">Çıkış</button>
                <a className="call-btn" href={`tel:${phoneTel}`}>{phoneDisplay}</a>
              </div>
            </header>

            {viewLoading && <div className="view-loader" role="status"><Spinner /> Sayfa yükleniyor</div>}
            {dataStatus && <p className="status-message">{dataStatus}</p>}

            {activeView === "dashboard" && (
              <section className="view-grid dashboard-view" id="dashboard">
                <div className="kpi-grid">
                  {kpis.map((kpi) => (
                    <article className={`kpi ${kpi.tone}`} key={kpi.label}>
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                      <em>{kpi.change}</em>
                    </article>
                  ))}
                </div>
                <article className="panel wide">
                  <div className="panel-head">
                    <h2>Günlük servis akışı</h2>
                    <button onClick={() => openView("calendar")} type="button">Takvime git</button>
                  </div>
                  {serviceRows.length === 0 && <p>Henüz Supabase servis kaydı yok.</p>}
                  {serviceRows.map((row) => {
                    const customer = data.customers.find((item) => item.id === row.customer_id);
                    return (
                      <div className="service-row" key={row.id}>
                        <span>{row.created_at?.slice(11, 16) || "--:--"}</span>
                        <strong>{customer?.full_name || "Müşteri"}</strong>
                        <em>{row.service_type}</em>
                        <b>{row.status}</b>
                        <small>{row.problem_summary}</small>
                      </div>
                    );
                  })}
                </article>
                <article className="panel">
                  <h2>Son yorumlar</h2>
                  <p>Yorum kaynağı bağlanınca gerçek müşteri yorumları burada listelenecek.</p>
                </article>
                <article className="panel">
                  <h2>Son AI içerikleri</h2>
                  {aiHistory.length === 0 && <p>Henüz Supabase AI içerik kaydı yok.</p>}
                  {aiHistory.map((item) => <p className="activity" key={item.id || item.topic}>{item.content_type}: {item.topic}</p>)}
                </article>
              </section>
            )}

            {activeView === "crm" && (
              <section className="view-grid crm-view">
                <article className="panel customer-list">
                  <div className="panel-head"><h2>Müşteri kartları</h2></div>
                  {data.customers.length === 0 && <p>Yeni müşteri formuyla ilk gerçek kaydı oluşturun.</p>}
                  {data.customers.map((customer) => {
                    const device = data.devices.find((item) => item.customer_id === customer.id);
                    return (
                      <button className={selectedCustomer?.id === customer.id ? "customer-card active" : "customer-card"} key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} type="button">
                        <strong>{customer.full_name}</strong>
                        <span>{device ? `${device.brand} ${device.device_type}` : "Cihaz eklenmedi"}</span>
                        <em>{customer.district}</em>
                      </button>
                    );
                  })}
                  <form className="mini-form" onSubmit={submitCustomer}>
                    <h3>Yeni müşteri</h3>
                    <label>Ad Soyad<input value={customerForm.full_name} onChange={(event) => setCustomerForm({ ...customerForm, full_name: event.target.value })} /></label>
                    <label>Telefon<input value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} /></label>
                    <label>İlçe<input value={customerForm.district} onChange={(event) => setCustomerForm({ ...customerForm, district: event.target.value })} /></label>
                    <label>Mahalle<input value={customerForm.neighborhood} onChange={(event) => setCustomerForm({ ...customerForm, neighborhood: event.target.value })} /></label>
                    <button className="primary-action" type="submit">Yeni müşteri kaydet</button>
                  </form>
                </article>

                <article className="panel crm-detail wide">
                  <div className="panel-head">
                    <h2>{selectedCustomer ? `${selectedCustomer.full_name} CRM dosyası` : "CRM dosyası"}</h2>
                    {selectedCustomer && <a href={`tel:${selectedCustomer.phone}`}>{selectedCustomer.phone}</a>}
                  </div>
                  <div className="crm-grid">
                    <section><h3>Cihaz geçmişi</h3>{data.devices.filter((item) => item.customer_id === selectedCustomer?.id).map((item) => <p key={item.id}>{item.brand} {item.device_type} {item.model || ""}</p>)}</section>
                    <section><h3>Yapılan işlemler</h3>{data.services.filter((item) => item.customer_id === selectedCustomer?.id).map((item) => <p key={item.id}>{item.operation_summary || item.problem_summary}</p>)}</section>
                    <section><h3>Kullanılan parçalar</h3><p>Kullanılan parça kayıtları Supabase used_parts tablosundan raporlanır.</p></section>
                    <section><h3>Garanti süresi</h3>{data.services.filter((item) => item.customer_id === selectedCustomer?.id).map((item) => <p key={item.id}>{item.warranty_until || "Garanti tarihi girilmedi"}</p>)}</section>
                  </div>
                  <label>Teknisyen notları<textarea value={selectedService?.technician_notes || ""} readOnly rows={4} /></label>
                  <div className="form-grid">
                    <form className="mini-form" onSubmit={submitDevice}>
                      <h3>Yeni cihaz</h3>
                      <label>Müşteri<select value={deviceForm.customer_id} onChange={(event) => setDeviceForm({ ...deviceForm, customer_id: event.target.value })}><option value="">Seçin</option>{data.customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.full_name}</option>)}</select></label>
                      <label>Cihaz<input value={deviceForm.device_type} onChange={(event) => setDeviceForm({ ...deviceForm, device_type: event.target.value })} /></label>
                      <label>Marka<input value={deviceForm.brand} onChange={(event) => setDeviceForm({ ...deviceForm, brand: event.target.value })} /></label>
                      <label>Model<input value={deviceForm.model} onChange={(event) => setDeviceForm({ ...deviceForm, model: event.target.value })} /></label>
                      <button className="primary-action" type="submit">Yeni cihaz kaydet</button>
                    </form>
                    <form className="mini-form" onSubmit={submitServiceRecord}>
                      <h3>Servis kaydı</h3>
                      <label>Müşteri<select value={recordForm.customer_id} onChange={(event) => setRecordForm({ ...recordForm, customer_id: event.target.value, device_id: "" })}><option value="">Seçin</option>{data.customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.full_name}</option>)}</select></label>
                      <label>Cihaz<select value={recordForm.device_id} onChange={(event) => setRecordForm({ ...recordForm, device_id: event.target.value })}><option value="">Seçin</option>{data.devices.filter((device) => !recordForm.customer_id || device.customer_id === recordForm.customer_id).map((device) => <option value={device.id} key={device.id}>{device.brand} {device.device_type}</option>)}</select></label>
                      <label>Servis türü<input value={recordForm.service_type} onChange={(event) => setRecordForm({ ...recordForm, service_type: event.target.value })} /></label>
                      <label>Arıza<textarea value={recordForm.problem_summary} onChange={(event) => setRecordForm({ ...recordForm, problem_summary: event.target.value })} rows={3} /></label>
                      <button className="primary-action" type="submit">Servis kaydı oluştur</button>
                    </form>
                  </div>
                </article>
              </section>
            )}

            {activeView === "ai" && (
              <section className="view-grid ai-view">
                <article className="panel wide">
                  <div className="panel-head">
                    <h2>Tek tık AI içerik üretimi</h2>
                    <button disabled={aiLoading} onClick={() => generateContent()} type="button">{aiLoading ? "Üretiliyor" : "Tek tıkla üret"}</button>
                  </div>
                  <div className="tool-grid">
                    {aiTools.map((tool) => <button className={aiType === tool ? "active" : ""} key={tool} onClick={() => setAiType(tool)} type="button">{tool}</button>)}
                  </div>
                  <form className="ai-form" onSubmit={generateContent}>
                    <label>Konu<textarea value={aiTopic} onChange={(event) => setAiTopic(event.target.value)} rows={3} /></label>
                    <button className="primary-action" disabled={aiLoading} type="submit">{aiLoading ? <><Spinner /> AI çalışıyor</> : "İçerik üret"}</button>
                  </form>
                  <output>{aiResult || "Üretilen profesyonel içerik burada görünecek."}</output>
                  <div className="history-list">
                    <h3>İçerik geçmişi</h3>
                    {aiHistory.length === 0 && <p>Henüz ai_content_items tablosunda kayıt yok.</p>}
                    {aiHistory.map((item) => (
                      <button key={item.id || `${item.content_type}-${item.topic}`} onClick={() => { setAiType(item.content_type); setAiTopic(item.topic); setAiResult(item.output); }} type="button">
                        Yeniden kullan: {item.content_type}
                      </button>
                    ))}
                  </div>
                </article>
              </section>
            )}

            {activeView === "receipt" && (
              <section className="view-grid receipt-view">
                <article className="panel receipt-form">
                  <h2>Servis fişi oluştur</h2>
                  <label>Servis kaydı<select value={selectedServiceId} onChange={(event) => setSelectedServiceId(event.target.value)}>{data.services.map((service) => <option value={service.id} key={service.id}>{service.service_type} - {service.problem_summary}</option>)}</select></label>
                  <button className="primary-action" onClick={downloadPdf} type="button">Profesyonel PDF indir</button>
                  {pdfStatus && <p className="status-message">{pdfStatus}</p>}
                </article>
                <article className="receipt-paper" aria-label="Profesyonel servis fişi">
                  <div className="receipt-head"><span className="receipt-logo">DB</span><div><strong>{businessName}</strong><p>Denizli ve Pamukkale servis yönetimi</p></div><QRCode /></div>
                  <div className="receipt-meta"><span>Fiş No: {selectedService?.id?.slice(0, 8) || "Bekliyor"}</span><span>Tarih: {new Date().toLocaleDateString("tr-TR")}</span><span>Telefon: {phoneDisplay}</span></div>
                  <div className="receipt-lines">
                    <p><strong>Müşteri:</strong> {selectedCustomer?.full_name || "Seçilmedi"}</p>
                    <p><strong>Cihaz:</strong> {selectedDevice ? `${selectedDevice.brand} ${selectedDevice.device_type}` : "Seçilmedi"}</p>
                    <p><strong>Arıza:</strong> {selectedService?.problem_summary || "Seçilmedi"}</p>
                    <p><strong>Yapılan işlem:</strong> {selectedService?.operation_summary || selectedService?.technician_notes || "İşlem girilmedi"}</p>
                    <p><strong>Garanti:</strong> {selectedService?.warranty_until || "Garanti tarihi girilmedi"}</p>
                  </div>
                  <div className="signature-row"><span>Müşteri imzası</span><span>Teknisyen imzası</span></div>
                </article>
              </section>
            )}

            {activeView === "calendar" && (
              <section className="view-grid calendar-view">
                <article className="panel wide">
                  <form className="form-grid" onSubmit={submitAppointment}>
                    <label>Servis kaydı<select value={appointmentForm.service_record_id} onChange={(event) => setAppointmentForm({ ...appointmentForm, service_record_id: event.target.value })}><option value="">Seçin</option>{data.services.map((service) => <option value={service.id} key={service.id}>{service.service_type} - {service.problem_summary}</option>)}</select></label>
                    <label>Teknisyen<input value={appointmentForm.technician_name} onChange={(event) => setAppointmentForm({ ...appointmentForm, technician_name: event.target.value })} /></label>
                    <label>Tarih ve saat<input type="datetime-local" value={appointmentForm.appointment_at} onChange={(event) => setAppointmentForm({ ...appointmentForm, appointment_at: event.target.value })} /></label>
                    <label>Durum<select value={appointmentForm.status} onChange={(event) => setAppointmentForm({ ...appointmentForm, status: event.target.value })}><option value="scheduled">Planlandı</option><option value="completed">Tamamlandı</option></select></label>
                    <button className="primary-action" type="submit">Randevu kaydet</button>
                  </form>
                </article>
                {dayNames.map((day) => (
                  <article className="day-column" key={day} onDragOver={(event) => event.preventDefault()} onDrop={() => void moveAppointment(day)}>
                    <h2>{day}</h2>
                    {data.appointments.filter((item) => dayName(item.appointment_at) === day).map((item) => {
                      const service = data.services.find((row) => row.id === item.service_record_id);
                      return (
                        <div className="appointment" draggable key={item.id} onDragStart={() => setDraggedId(item.id)}>
                          <strong>{new Date(item.appointment_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</strong>
                          <span>{service?.service_type || "Servis"} - {service?.problem_summary || "Randevu"}</span>
                          <em>{item.technician_name || "Teknisyen atanmadı"}</em>
                        </div>
                      );
                    })}
                  </article>
                ))}
              </section>
            )}

            {activeView === "notifications" && (
              <section className="view-grid notification-view">
                <article className="panel wide">
                  <div className="panel-head"><h2>Bildirim merkezi</h2><button onClick={() => setNotifications((items) => [`Veriler yenilendi: ${new Date().toLocaleTimeString("tr-TR")}`, ...items])} type="button">Yeni servis bildirimi simüle et</button></div>
                  {notifications.length === 0 && <p>Yeni işlem olduğunda bildirimler burada görünür.</p>}
                  {notifications.map((notification, index) => <div className="notification" key={`${notification}-${index}`}><span>{index === 0 ? "Yeni" : "Okundu"}</span><strong>{notification}</strong></div>)}
                </article>
              </section>
            )}

            {activeView === "website" && (
              <section className="view-grid website-view">
                <article className="public-hero wide">
                  <span>Profesyonel müşteri web sitesi</span>
                  <h2>Denizli ve Pamukkale için hızlı beyaz eşya ve klima servisi</h2>
                  <p>WhatsApp talep formu, arama butonu ve servis kayıtları Supabase veritabanına bağlı çalışır.</p>
                  <div><a className="primary-action" href={`tel:${phoneTel}`}>{phoneDisplay} ara</a><a className="secondary-action" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp servis talebi</a></div>
                </article>
                <ServiceRequestForm formStatus={formStatus} serviceForm={serviceForm} setServiceForm={setServiceForm} submitServiceRequest={submitServiceRequest} whatsappUrl={whatsappUrl} />
              </section>
            )}
          </section>
          <FloatingActions whatsappUrl={whatsappUrl} />
        </>
      ) : null}
    </main>
  );
}

function FloatingActions({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <div className="floating-actions" aria-label="Hızlı iletişim">
      <a href={`tel:${phoneTel}`}>Ara</a>
      <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  );
}

function ServiceRequestForm({
  formStatus,
  serviceForm,
  setServiceForm,
  submitServiceRequest,
  whatsappUrl,
}: {
  formStatus: string;
  serviceForm: {
    fullName: string;
    phone: string;
    device: string;
    brand: string;
    fault: string;
    district: string;
    neighborhood: string;
    description: string;
  };
  setServiceForm: (value: {
    fullName: string;
    phone: string;
    device: string;
    brand: string;
    fault: string;
    district: string;
    neighborhood: string;
    description: string;
  }) => void;
  submitServiceRequest: (event: FormEvent) => void;
  whatsappUrl: string;
}) {
  return (
    <form className="panel wide public-form" onSubmit={submitServiceRequest}>
      <h2>Gerçek servis talep formu</h2>
      <div className="form-grid">
        <label>Ad Soyad<input required minLength={3} value={serviceForm.fullName} onChange={(event) => setServiceForm({ ...serviceForm, fullName: event.target.value })} /></label>
        <label>Telefon<input required pattern="0?5[0-9]{9}" value={serviceForm.phone} onChange={(event) => setServiceForm({ ...serviceForm, phone: event.target.value })} /></label>
        <label>Cihaz<input required value={serviceForm.device} onChange={(event) => setServiceForm({ ...serviceForm, device: event.target.value })} /></label>
        <label>Marka<input required value={serviceForm.brand} onChange={(event) => setServiceForm({ ...serviceForm, brand: event.target.value })} /></label>
        <label>Arıza<input required minLength={4} value={serviceForm.fault} onChange={(event) => setServiceForm({ ...serviceForm, fault: event.target.value })} /></label>
        <label>İlçe<input required value={serviceForm.district} onChange={(event) => setServiceForm({ ...serviceForm, district: event.target.value })} /></label>
        <label>Mahalle<input required value={serviceForm.neighborhood} onChange={(event) => setServiceForm({ ...serviceForm, neighborhood: event.target.value })} /></label>
      </div>
      <label>Açıklama<textarea required minLength={8} value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} rows={4} /></label>
      <button className="primary-action" type="submit">Talebi Supabase&apos;e kaydet</button>
      <a className="secondary-action" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp mesajı oluştur</a>
      {formStatus && <p className="status-message">{formStatus}</p>}
    </form>
  );
}

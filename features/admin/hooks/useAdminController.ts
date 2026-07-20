"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { aiTypes } from "../../ai-content/constants";
import { companySettings } from "../../settings/company";
import type { AdminData, AdminSection, DashboardSummary, SetupStatus } from "../../shared/types";
import { emptyData } from "../../shared/types";
import { currency, localDateTime, postJson } from "../../shared/utils";

const endpointBySection: Record<AdminSection, string> = {
  dashboard: "/api/admin/summary",
  customers: "/api/admin/customers",
  requests: "/api/admin/requests",
  appointments: "/api/admin/appointments",
  "work-records": "/api/admin/jobs",
  devices: "/api/admin/devices",
  "ai-content": "/api/admin/ai-content",
  whatsapp: "/api/admin/templates",
  pdf: "/api/admin/pdf-data",
  settings: "/api/auth/session",
};

export function useAdminController(section: AdminSection) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<AdminData>(emptyData);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [customerForm, setCustomerForm] = useState({ full_name: "", phone: "", district: companySettings.defaultDistrict, neighborhood: "" });
  const [requestForm, setRequestForm] = useState({ customer_id: "", subject: "", description: "", status: "new" });
  const [deviceForm, setDeviceForm] = useState({ customer_id: "", device_type: "", brand: "", model: "" });
  const [jobForm, setJobForm] = useState({ customer_id: "", device_id: "", title: "", description: "", status: "open", price: "0", warranty_until: "" });
  const [appointmentForm, setAppointmentForm] = useState(() => ({
    customer_id: "",
    job_id: "",
    appointment_at: localDateTime(new Date(Date.now() + 86400000)),
    status: "scheduled",
    note: "",
  }));
  const [templateForm, setTemplateForm] = useState({ channel: "WhatsApp", title: "İlk temas", body: "Merhaba, talebinizi aldık. En kısa sürede dönüş yapacağız." });
  const [aiForm, setAiForm] = useState({ type: aiTypes[0], topic: "Denizli'de aynı gün servis", tone: "güven veren" });
  const [setupForm, setSetupForm] = useState({
    companyName: companySettings.referenceCompany,
    phone: companySettings.phoneDisplay,
    adminEmail: "",
    adminPassword: "",
  });
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const kpis = useMemo(() => {
    if (summary) {
      return [
        ["Müşteri", summary.customerCount],
        ["Açık talep", summary.openRequests],
        ["Randevu", summary.appointmentCount],
        ["Açık iş", summary.openJobs],
        ["Ciro", currency(summary.revenue)],
      ];
    }

    return [
      ["Müşteri", data.customers.length],
      ["Açık talep", data.requests.filter((item) => item.status !== "done").length],
      ["Randevu", data.appointments.length],
      ["Açık iş", data.jobs.filter((item) => item.status !== "done").length],
      ["Ciro", currency(data.jobs.reduce((sum, item) => sum + Number(item.price || 0), 0))],
    ];
  }, [data, summary]);

  const loadData = useCallback(async (target: AdminSection = section) => {
    setStatus("Veriler yükleniyor...");
    try {
      const res = await fetch(endpointBySection[target], { cache: "no-store" });
      const json = (await res.json()) as Partial<AdminData> & {
        error?: string;
        summary?: DashboardSummary;
        recentRequests?: AdminData["requests"];
        recentContent?: AdminData["content"];
      };
      if (!res.ok) {
        setStatus(json.error || "Veriler yüklenemedi.");
        return;
      }

      setSummary(json.summary || null);
      setData({
        customers: json.customers || [],
        requests: json.requests || json.recentRequests || [],
        devices: json.devices || [],
        jobs: json.jobs || [],
        appointments: json.appointments || [],
        content: json.content || json.recentContent || [],
        templates: json.templates || [],
      });
      setStatus("Veriler Supabase üzerinden yüklendi.");
    } catch {
      setStatus("Supabase bağlantısı kurulamadı. Environment ayarlarını kontrol edin.");
    }
  }, [section]);

  useEffect(() => {
    fetch("/api/setup", { cache: "no-store" })
      .then((res) => res.json())
      .then((setup: SetupStatus) => {
        setSetupStatus(setup);
        if (!setup.installed) {
          setReady(true);
          return null;
        }
        return fetch("/api/auth/session", { cache: "no-store" });
      })
      .then((res) => res?.json())
      .then((session: { authenticated?: boolean } | undefined) => {
        if (!session) return;
        setAuthenticated(Boolean(session.authenticated));
        if (session.authenticated) void loadData(section);
      })
      .catch(() => setStatus("Kurulum durumu kontrol edilemedi. Environment ayarlarını kontrol edin."))
      .finally(() => setReady(true));
  }, [loadData, section]);

  async function createRecord(kind: string, form: Record<string, unknown>, success: string) {
    setLoading(true);
    setStatus("Kaydediliyor...");
    try {
      await postJson("/api/admin/records", { kind, data: form });
      setStatus(success);
      await loadData(section);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Kayıt oluşturulamadı.");
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
      await loadData(section);
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
      const json = await postJson<{ message?: string }>("/api/setup", setupForm);
      setSetupStatus({ ready: true, installed: true });
      setAuthenticated(true);
      setStatus(json.message || "Kurulum tamamlandı.");
      await loadData(section);
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
    setSummary(null);
    setStatus("Çıkış yapıldı.");
  }

  async function generateAi(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setAiResult("");
    try {
      const json = await postJson<{ content?: string }>("/api/ai/content", aiForm);
      setAiResult(json.content || "");
      await loadData(section);
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

  return {
    dark,
    setDark,
    ready,
    setupStatus,
    authenticated,
    status,
    data,
    summary,
    login,
    setLogin,
    customerForm,
    setCustomerForm,
    requestForm,
    setRequestForm,
    deviceForm,
    setDeviceForm,
    jobForm,
    setJobForm,
    appointmentForm,
    setAppointmentForm,
    templateForm,
    setTemplateForm,
    aiForm,
    setAiForm,
    setupForm,
    setSetupForm,
    aiResult,
    loading,
    kpis,
    loadData,
    createRecord,
    submitLogin,
    submitSetup,
    logout,
    generateAi,
    downloadPdf,
  };
}

export type AdminController = ReturnType<typeof useAdminController>;

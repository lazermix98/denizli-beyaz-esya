"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { aiTypes } from "../../ai-content/constants";
import { companySettings } from "../../settings/company";
import type { AdminData, SetupStatus } from "../../shared/types";
import { emptyData } from "../../shared/types";
import { currency, localDateTime, postJson } from "../../shared/utils";

export function useAdminController() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState<AdminData>(emptyData);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [customerForm, setCustomerForm] = useState({ full_name: "", phone: "", district: companySettings.defaultDistrict, neighborhood: "" });
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
      const json = await postJson<{ message?: string }>("/api/setup", setupForm);
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
      const json = await postJson<{ content?: string }>("/api/ai/content", aiForm);
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

  return {
    dark,
    setDark,
    ready,
    setupStatus,
    authenticated,
    status,
    data,
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

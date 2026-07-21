"use client";

import { FormEvent, useState } from "react";
import { companySettings, services } from "../../features/settings/company";
import { postJson } from "../../features/shared/utils";

export function PublicHome() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicForm, setPublicForm] = useState({
    fullName: "",
    phone: "",
    service: "Buzdolabı servisi",
    district: companySettings.defaultDistrict,
    neighborhood: "",
    description: "",
    website: "",
  });

  async function submitPublicRequest(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("Talebiniz gönderiliyor...");
    try {
      await postJson("/api/service-requests", publicForm);
      setStatus("Talep kaydedildi. Yönetim panelinde görünür.");
      setPublicForm({ ...publicForm, fullName: "", phone: "", neighborhood: "", description: "", website: "" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Talep kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app public-app">
      <section className="site">
        <nav className="site-nav">
          <strong>{companySettings.productName}</strong>
          <div>
            <a href={`tel:${companySettings.phoneTel}`}>{companySettings.phoneDisplay}</a>
            <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </nav>
        <header className="hero">
          <p>Dijital işletme yönetimi ve yapay zekâ otomasyonu</p>
          <h1>Her sektöre uyarlanabilen müşteri, randevu, içerik ve iş takip sistemi</h1>
          <span>İlk referans müşteri: {companySettings.referenceCompany}</span>
          <div className="hero-actions">
            <a href="/admin">Yönetim panelini incele</a>
            <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp talebi oluştur</a>
          </div>
        </header>
        <section className="trust-strip" aria-label="Ürün kapsamı">
          <article><strong>Multi-tenant</strong><span>Firma verileri ayrılır</span></article>
          <article><strong>Production DB</strong><span>Supabase üzerinde kalıcı veri</span></article>
          <article><strong>Mobil panel</strong><span>Sahada hızlı kullanım</span></article>
          <article><strong>AI hazir</strong><span>Feature flag ile yonetilir</span></article>
        </section>
        <section className="service-grid">
          {services.map((service) => <article key={service}>{service}</article>)}
        </section>
        <form className="public-form" onSubmit={submitPublicRequest}>
          <div className="section-heading">
            <h2>Müşteri talep formu</h2>
            <span>Supabase kaydı aktif</span>
          </div>
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
        {status && <p className="status">{status}</p>}
      </section>
    </main>
  );
}

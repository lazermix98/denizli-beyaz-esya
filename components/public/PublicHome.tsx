"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { companySettings, services } from "../../features/settings/company";
import { postJson } from "../../features/shared/utils";

const sectors = [
  "Beyaz eşya servisleri",
  "Elektrikçiler",
  "Kombi ve klima servisleri",
  "Oto servisleri",
  "Emlak ofisleri",
  "Kuaför ve güzellik merkezleri",
  "Diş klinikleri",
  "Kafe ve restoranlar",
];

const outcomes = [
  ["Talep kaçırmayın", "Web sitesi, WhatsApp ve form talepleri tek sistemde toplanır."],
  ["Randevuları düzenleyin", "Günlük işler, müşteri bilgileri ve servis geçmişi aynı panelden izlenir."],
  ["İçerik üretimini hızlandırın", "Instagram, TikTok, Google İşletme ve blog içerikleri kontrollü şekilde hazırlanır."],
  ["Profesyonel görünün", "PDF iş formları, kayıtlı müşteri geçmişi ve düzenli operasyon akışı güven verir."],
];

const modules = [
  "Müşteri ve talep yönetimi",
  "Randevu ve iş takibi",
  "Cihaz veya hizmet geçmişi",
  "PDF servis / iş formu",
  "WhatsApp mesaj şablonları",
  "AI içerik üretim merkezi",
  "İçerik geçmişi",
  "Firma ayarları",
];

export function PublicHome() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [publicForm, setPublicForm] = useState({
    fullName: "",
    phone: "",
    service: "Dijital işletme yönetim sistemi",
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
      setStatus("Kaydınız oluşturuldu. En kısa sürede sizinle iletişime geçilecektir.");
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

        <header className="hero product-hero">
          <div className="hero-copy">
            <p>KOBİ işletmeleri için satış, talep ve operasyon otomasyonu</p>
            <h1>Her sektöre uyarlanabilen dijital işletme yönetim sistemi</h1>
            <span>
              Web sitesi, müşteri talebi, randevu, iş takibi, PDF rapor ve içerik üretimini tek panelde birleştirir.
              İlk referans uygulama: {companySettings.referenceCompany}.
            </span>
            <div className="hero-actions">
              <a href="/demo-admin">Demo paneli incele</a>
              <a href="#demo-talep">Demo talep et</a>
              <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp ile görüş</a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Ürün paneli önizlemesi">
            <Image
              src="/images/saas-dashboard-hero.png"
              alt="Farklı sektörlere uyarlanabilen işletme yönetim paneli önizlemesi"
              width={1792}
              height={1024}
              priority
            />
          </div>
        </header>

        <section className="trust-strip" aria-label="Ürün değeri">
          <article><strong>Tek panel</strong><span>Müşteri, talep, randevu ve iş kayıtları birlikte yönetilir</span></article>
          <article><strong>Sektör bağımsız</strong><span>Servis, sağlık, güzellik, emlak ve yeme içme işletmelerine uyarlanır</span></article>
          <article><strong>Satışa hazır</strong><span>Firma bilgileriniz, hizmetleriniz ve iş akışınızla markalanır</span></article>
          <article><strong>Mobil kullanım</strong><span>Telefon ekranında hızlı kayıt ve takip için optimize edilir</span></article>
        </section>

        <section className="product-section">
          <div className="section-kicker">Neyi çözer?</div>
          <div className="section-title-row">
            <h2>Dağınık WhatsApp mesajlarını, notları ve Excel listelerini düzenli bir sisteme dönüştürür.</h2>
            <p>İşletme sahibi ne geldiğini, kime dönüleceğini, hangi işin tamamlandığını ve hangi içeriğin yayınlanacağını tek yerden görür.</p>
          </div>
          <figure className="workflow-visual">
            <Image
              src="/images/saas-workflow-visual.png"
              alt="Talep, müşteri, randevu, iş kaydı, PDF rapor ve içerik akışını gösteren kurumsal otomasyon görseli"
              width={1792}
              height={1024}
            />
          </figure>
          <div className="outcome-grid">
            {outcomes.map(([title, text]) => (
              <article key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="product-section module-showcase">
          <div>
            <div className="section-kicker">Ürün modülleri</div>
            <h2>Satın alan firma yalnızca bir web sitesi değil, günlük operasyon paneli alır.</h2>
            <p>Kurulumdan sonra firma kendi müşterilerini, taleplerini, randevularını, iş kayıtlarını ve içeriklerini aynı sistemde yönetir.</p>
          </div>
          <div className="module-grid">
            {modules.map((module) => <article key={module}>{module}</article>)}
          </div>
        </section>

        <section className="product-section">
          <div className="section-kicker">Hangi sektörlere uyar?</div>
          <div className="sector-grid">
            {sectors.map((sector) => <article key={sector}>{sector}</article>)}
          </div>
        </section>

        <section className="product-section service-positioning">
          <div>
            <div className="section-kicker">İlk demo firma</div>
            <h2>{companySettings.referenceCompany}</h2>
            <p>
              Bu kurulum beyaz eşya ve teknik servis akışıyla hazırlanmıştır. Aynı altyapı farklı sektörlerde hizmet adı,
              form alanları, müşteri kayıtları ve iş süreçleri değiştirilerek kullanılabilir.
            </p>
          </div>
          <div className="service-grid">
            {services.slice(0, 8).map((service) => <article key={service}>{service}</article>)}
          </div>
        </section>

        <form id="demo-talep" className="public-form" onSubmit={submitPublicRequest}>
          <div className="section-heading">
            <h2>Müşteri talep formu ve demo başvurusu</h2>
            <span>İşletmenize uygun kurulum için sizi arayalım</span>
          </div>
          <div className="form-grid">
            <label>Ad Soyad<input required minLength={3} value={publicForm.fullName} onChange={(e) => setPublicForm({ ...publicForm, fullName: e.target.value })} /></label>
            <label>Telefon<input required pattern="0?5[0-9]{9}" value={publicForm.phone} onChange={(e) => setPublicForm({ ...publicForm, phone: e.target.value })} /></label>
            <label>İşletme türü<input required value={publicForm.service} onChange={(e) => setPublicForm({ ...publicForm, service: e.target.value })} /></label>
            <label>İlçe<input required value={publicForm.district} onChange={(e) => setPublicForm({ ...publicForm, district: e.target.value })} /></label>
            <label>Firma adı<input required value={publicForm.neighborhood} onChange={(e) => setPublicForm({ ...publicForm, neighborhood: e.target.value })} /></label>
          </div>
          <label>İhtiyacınız<textarea required minLength={8} rows={4} value={publicForm.description} onChange={(e) => setPublicForm({ ...publicForm, description: e.target.value })} /></label>
          <label className="honeypot">Website<input tabIndex={-1} autoComplete="off" value={publicForm.website} onChange={(e) => setPublicForm({ ...publicForm, website: e.target.value })} /></label>
          <button disabled={loading} type="submit">{loading ? "Gönderiliyor..." : "Demo talebi gönder"}</button>
        </form>
        {status && <p className="status">{status}</p>}
      </section>
    </main>
  );
}

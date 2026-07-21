"use client";

import type { AdminController } from "../../features/admin/hooks/useAdminController";
import { sectorOptions, getSectorConfig, type SectorKey } from "../../features/sectors/config";

export function SetupWizard({ controller }: { controller: AdminController }) {
  const { setupStatus, setupForm, setSetupForm, submitSetup, loading, status } = controller;
  const selectedSector = getSectorConfig(setupForm.sectorKey);

  return (
    <main className="setup-screen">
      <section className="setup-card">
        <span className="setup-badge">İlk açılış kurulumu</span>
        <h1>Kurulumu Başlat</h1>
        <p>
          İşletme türünü seçin. Menü, dashboard metrikleri, form başlıkları ve varsayılan iş akışları bu seçime göre hazırlanır.
        </p>
        {setupStatus?.missingEnv && setupStatus.missingEnv.length > 0 ? (
          <div className="setup-warning">
            <strong>Eksik environment değişkenleri</strong>
            <p>{setupStatus.missingEnv.join(", ")}</p>
            <small>Bu değerler Vercel Project Settings içindeki Environment Variables alanında olmalı.</small>
          </div>
        ) : setupStatus?.error ? (
          <div className="setup-warning">
            <strong>Bağlantı kontrolü başarısız</strong>
            <p>{setupStatus.error}</p>
          </div>
        ) : (
          <form className="setup-form" onSubmit={submitSetup}>
            <label>İşletme türü<select required value={setupForm.sectorKey} onChange={(e) => setSetupForm({ ...setupForm, sectorKey: e.target.value as SectorKey })}>
              {sectorOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select></label>
            <div className="setup-warning">
              <strong>{selectedSector.name}</strong>
              <p>{selectedSector.description}</p>
              <small>Aktif modüller: {selectedSector.modules.join(", ")}</small>
            </div>
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

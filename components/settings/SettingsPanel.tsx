import { PageHeader, SectionCard, StatusBadge } from "../shared/AdminUi";
import { companySettings } from "../../features/settings/company";

export function SettingsPanel() {
  return (
    <section className="module-page">
      <PageHeader
        eyebrow="Firma yönetimi"
        title="Firma ayarları ve demo/referans"
        description="Firma adı, telefon, çoklu firma mimarisi ve yayın durumunu kontrol edin."
      />
      <SectionCard title="Kurulum bilgileri" eyebrow="Production">
        <div className="settings-grid">
          <article><span>Firma</span><strong>{companySettings.referenceCompany}</strong></article>
          <article><span>Telefon</span><strong>{companySettings.phoneDisplay}</strong></article>
          <article><span>Veri izolasyonu</span><StatusBadge>company_id hazır</StatusBadge></article>
          <article><span>Deployment</span><StatusBadge>Vercel .next build</StatusBadge></article>
        </div>
      </SectionCard>
    </section>
  );
}

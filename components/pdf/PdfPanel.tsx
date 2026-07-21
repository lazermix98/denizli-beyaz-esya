"use client";

import { PageHeader, SectionCard } from "../shared/AdminUi";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function PdfPanel({ controller }: { controller: AdminController }) {
  return (
    <section className="module-page">
      <PageHeader
        eyebrow="Servis formu"
        title="PDF rapor oluşturma"
        description="Müşteri ve iş kaydı bulunduğunda profesyonel servis formu indirilebilir."
        actions={<button onClick={controller.downloadPdf} type="button">PDF indir</button>}
      />
      <SectionCard title="PDF ön koşulları" eyebrow="Kontrol">
        <div className="activity-list">
          <p>PDF oluşturmak için en az bir müşteri kaydı gerekir.</p>
          <p>Servis veya iş kaydı olmadan rapor indirimi engellenir.</p>
          <p>Türkçe karakterler ve firma bilgileri PDF içine eklenir.</p>
        </div>
      </SectionCard>
    </section>
  );
}

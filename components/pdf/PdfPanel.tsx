"use client";

import { CrudCard } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function PdfPanel({ controller }: { controller: AdminController }) {
  return (
    <CrudCard title="PDF rapor oluşturma" items={["Müşteri ve iş kaydı varsa PDF indirilebilir."]}>
      <button onClick={controller.downloadPdf} type="button">PDF indir</button>
    </CrudCard>
  );
}

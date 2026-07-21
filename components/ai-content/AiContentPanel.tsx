"use client";

import { CrudCard } from "../shared/RecordList";
import { SectionCard } from "../shared/AdminUi";
import { aiTypes } from "../../features/ai-content/constants";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function AiContentPanel({ controller }: { controller: AdminController }) {
  const { data, aiForm, setAiForm, generateAi, aiResult, loading } = controller;
  const disabled = aiResult.toLowerCase().includes("unavailable") || aiResult.toLowerCase().includes("disabled");

  return (
    <CrudCard
      title="AI içerik üretim merkezi"
      description="AI özelliği açıksa sosyal medya, Google İşletme, blog ve WhatsApp içerikleri üretir."
      items={data.content.map((item) => `${item.content_type}: ${item.topic} - İçerik`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="ai-form" onSubmit={generateAi}>
        <label>İçerik türü<select value={aiForm.type} onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}>
          {aiTypes.map((type) => <option key={type}>{type}</option>)}
        </select></label>
        <label>Konu<textarea value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} /></label>
        <button disabled={loading} type="submit">AI içerik üret</button>
      </form>
      <SectionCard title={disabled ? "AI özelliği şu anda etkin değil" : "Üretim sonucu"} eyebrow={disabled ? "Kontrollü durum" : "Önizleme"}>
        <output>{aiResult || "Üretilen içerik burada görünür."}</output>
      </SectionCard>
    </CrudCard>
  );
}

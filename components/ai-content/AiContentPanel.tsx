"use client";

import { CrudCard } from "../shared/RecordList";
import { aiTypes } from "../../features/ai-content/constants";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function AiContentPanel({ controller }: { controller: AdminController }) {
  const { data, aiForm, setAiForm, generateAi, aiResult, loading } = controller;

  return (
    <CrudCard
      title="AI içerik üretim merkezi"
      items={data.content.map((item) => `${item.content_type}: ${item.topic}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="ai-form" onSubmit={generateAi}>
        <select value={aiForm.type} onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}>
          {aiTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <textarea value={aiForm.topic} onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })} />
        <button disabled={loading} type="submit">AI içerik üret</button>
      </form>
      <output>{aiResult || "Üretilen içerik burada görünür."}</output>
    </CrudCard>
  );
}

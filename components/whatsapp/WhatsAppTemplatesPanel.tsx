"use client";

import { CrudCard } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function WhatsAppTemplatesPanel({ controller }: { controller: AdminController }) {
  const { data, templateForm, setTemplateForm, createRecord } = controller;

  return (
    <CrudCard title="WhatsApp mesaj şablonları" items={data.templates.map((item) => `${item.channel}: ${item.body}`)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("template", templateForm, "Şablon kaydedildi."); }}>
        <input value={templateForm.channel} onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })} />
        <input value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} />
        <input value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
        <button type="submit">Şablon kaydet</button>
      </form>
    </CrudCard>
  );
}

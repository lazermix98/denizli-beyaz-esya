"use client";

import { CrudCard } from "../shared/RecordList";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function WhatsAppTemplatesPanel({ controller }: { controller: AdminController }) {
  const { data, templateForm, setTemplateForm, createRecord } = controller;
  const firstCustomer = data.customers[0];
  const previewText = templateForm.body || data.templates[0]?.body || "";
  const phone = firstCustomer?.phone?.replace(/\D/g, "").replace(/^0/, "90");
  const whatsappHref = phone && previewText ? `https://wa.me/${phone}?text=${encodeURIComponent(previewText)}` : "";

  return (
    <CrudCard
      title="WhatsApp mesaj şablonları"
      items={data.templates.map((item) => `${item.channel}: ${item.body}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("template", templateForm, "Şablon kaydedildi."); }}>
        <input aria-label="Kanal" value={templateForm.channel} onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })} />
        <input aria-label="Başlık" value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} />
        <input aria-label="Mesaj" value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
        <button type="submit">Şablon kaydet</button>
      </form>
      <div className="action-strip">
        <div>
          <strong>Hazır mesaj aksiyonu</strong>
          <p>Listedeki ilk müşteri için seçili şablon WhatsApp uygulamasında açılır.</p>
        </div>
        {whatsappHref ? (
          <a className="button-link" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp ile aç</a>
        ) : (
          <button disabled type="button">Müşteri ve mesaj gerekli</button>
        )}
      </div>
    </CrudCard>
  );
}

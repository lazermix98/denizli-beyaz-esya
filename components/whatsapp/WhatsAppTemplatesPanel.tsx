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
      description="Sık kullanılan müşteri bilgilendirme mesajlarını standartlaştırın."
      items={data.templates.map((item) => `${item.channel}: ${item.title || "Şablon"} - ${item.body}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("template", templateForm, "Şablon kaydedildi."); }}>
        <label>Kanal<input value={templateForm.channel} onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })} /></label>
        <label>Başlık<input value={templateForm.title} onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })} /></label>
        <label>Mesaj<input value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} /></label>
        <button type="submit">Şablon kaydet</button>
      </form>
      <div className="action-strip">
        <div>
          <strong>Hazır mesaj aksiyonu</strong>
          <p>Seçili şablon ilk müşteri için WhatsApp uygulamasında hazır mesaj olarak açılır.</p>
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

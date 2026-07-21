"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function RequestsPanel({ controller }: { controller: AdminController }) {
  const { data, requestForm, setRequestForm, createRecord } = controller;
  const record = controller.sector.dictionary.record;

  return (
    <CrudCard
      title={`${record}lar`}
      description={`${record} akışlarını web, telefon ve WhatsApp kanallarıyla birlikte takip edin.`}
      items={data.requests.map((item) => `${item.subject} - ${item.description || "Açıklama yok"} - ${item.status}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("request", requestForm, `${record} kaydedildi.`); }}>
        <label>{controller.sector.dictionary.customer}<SelectCustomer customers={data.customers} value={requestForm.customer_id} onChange={(value) => setRequestForm({ ...requestForm, customer_id: value })} /></label>
        <label>Konu<input required value={requestForm.subject} onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })} /></label>
        <label>Açıklama<input value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} /></label>
        <button type="submit">{controller.sector.formLabels.requests || `Yeni ${record.toLowerCase()} oluştur`}</button>
      </form>
    </CrudCard>
  );
}

"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function RequestsPanel({ controller }: { controller: AdminController }) {
  const { data, requestForm, setRequestForm, createRecord } = controller;

  return (
    <CrudCard
      title="Talepler"
      items={data.requests.map((item) => `${item.subject} - ${item.status}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("request", requestForm, "Talep kaydedildi."); }}>
        <SelectCustomer customers={data.customers} value={requestForm.customer_id} onChange={(value) => setRequestForm({ ...requestForm, customer_id: value })} />
        <input placeholder="Konu" value={requestForm.subject} onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })} />
        <input placeholder="Açıklama" value={requestForm.description} onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })} />
        <button type="submit">Talep oluştur</button>
      </form>
    </CrudCard>
  );
}

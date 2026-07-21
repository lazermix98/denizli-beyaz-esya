"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";
import { currency } from "../../features/shared/utils";

export function WorkRecordsPanel({ controller }: { controller: AdminController }) {
  const { data, jobForm, setJobForm, createRecord } = controller;

  return (
    <CrudCard
      title="İş / servis kayıtları"
      description="Arıza, işlem, ücret, garanti ve servis durumlarını takip edin."
      items={data.jobs.map((item) => `${item.title} - ${currency(Number(item.price || 0))} - ${item.status}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("job", jobForm, "İş kaydı oluşturuldu."); }}>
        <label>Müşteri<SelectCustomer customers={data.customers} value={jobForm.customer_id} onChange={(value) => setJobForm({ ...jobForm, customer_id: value })} /></label>
        <label>İş başlığı<input required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></label>
        <label>Açıklama<input value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></label>
        <label>Ücret<input value={jobForm.price} onChange={(e) => setJobForm({ ...jobForm, price: e.target.value })} /></label>
        <button type="submit">İş kaydı oluştur</button>
      </form>
    </CrudCard>
  );
}

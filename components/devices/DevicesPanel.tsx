"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function DevicesPanel({ controller }: { controller: AdminController }) {
  const { data, deviceForm, setDeviceForm, createRecord } = controller;

  return (
    <CrudCard
      title="Cihaz yönetimi"
      description="Müşterilere bağlı cihaz, marka, model ve geçmiş kayıtlarını yönetin."
      items={data.devices.map((item) => `${item.device_type} - ${item.brand || "Marka yok"} ${item.model || ""} - Cihaz`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("device", deviceForm, "Cihaz kaydedildi."); }}>
        <label>Müşteri<SelectCustomer customers={data.customers} value={deviceForm.customer_id} onChange={(value) => setDeviceForm({ ...deviceForm, customer_id: value })} /></label>
        <label>Cihaz türü<input required value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })} /></label>
        <label>Marka<input value={deviceForm.brand} onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })} /></label>
        <label>Model<input value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} /></label>
        <button type="submit">Cihaz ekle</button>
      </form>
    </CrudCard>
  );
}

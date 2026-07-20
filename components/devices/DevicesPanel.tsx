"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function DevicesPanel({ controller }: { controller: AdminController }) {
  const { data, deviceForm, setDeviceForm, createRecord } = controller;

  return (
    <CrudCard title="Cihaz yönetimi" items={data.devices.map((item) => `${item.device_type} - ${item.brand || "Marka yok"} ${item.model || ""}`)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("device", deviceForm, "Cihaz kaydedildi."); }}>
        <SelectCustomer customers={data.customers} value={deviceForm.customer_id} onChange={(value) => setDeviceForm({ ...deviceForm, customer_id: value })} />
        <input placeholder="Cihaz türü" value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })} />
        <input placeholder="Marka" value={deviceForm.brand} onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })} />
        <input placeholder="Model" value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} />
        <button type="submit">Cihaz ekle</button>
      </form>
    </CrudCard>
  );
}

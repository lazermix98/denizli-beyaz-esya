"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function DevicesPanel({ controller }: { controller: AdminController }) {
  const { data, deviceForm, setDeviceForm, createRecord } = controller;
  const asset = controller.sector.dictionary.asset;

  return (
    <CrudCard
      title={`${asset} yönetimi`}
      description={`${asset}, marka, model ve geçmiş bilgilerini müşteri kayıtlarıyla ilişkilendirin.`}
      items={data.devices.map((item) => `${item.device_type} - ${item.brand || "Marka yok"} ${item.model || ""} - ${asset}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("device", deviceForm, "Cihaz kaydedildi."); }}>
        <label>{controller.sector.dictionary.customer}<SelectCustomer customers={data.customers} value={deviceForm.customer_id} onChange={(value) => setDeviceForm({ ...deviceForm, customer_id: value })} /></label>
        <label>{asset} türü<input required value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })} /></label>
        <label>Marka<input value={deviceForm.brand} onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })} /></label>
        <label>Model<input value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} /></label>
        <button type="submit">{controller.sector.formLabels.devices || `${asset} ekle`}</button>
      </form>
    </CrudCard>
  );
}

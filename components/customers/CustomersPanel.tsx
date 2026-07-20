"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function CustomersPanel({ controller }: { controller: AdminController }) {
  const { data, customerForm, setCustomerForm, deviceForm, setDeviceForm, createRecord } = controller;

  return (
    <CrudCard title="Müşteriler" items={data.customers.map((item) => `${item.full_name} - ${item.phone}`)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("customer", customerForm, "Müşteri kaydedildi."); }}>
        <input placeholder="Ad soyad" value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} />
        <input placeholder="Telefon" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
        <input placeholder="İlçe" value={customerForm.district} onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })} />
        <input placeholder="Mahalle" value={customerForm.neighborhood} onChange={(e) => setCustomerForm({ ...customerForm, neighborhood: e.target.value })} />
        <button type="submit">Müşteri oluştur</button>
      </form>
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

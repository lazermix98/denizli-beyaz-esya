"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function CustomersPanel({ controller }: { controller: AdminController }) {
  const { data, customerForm, setCustomerForm, deviceForm, setDeviceForm, createRecord } = controller;

  return (
    <CrudCard
      title="Müşteriler"
      description="Müşteri kartları, iletişim bilgileri ve bağlı cihaz kayıtlarını yönetin."
      items={data.customers.map((item) => `${item.full_name} - ${item.phone} - ${item.district || "Bölge yok"}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("customer", customerForm, "Müşteri kaydedildi."); }}>
        <label>Ad soyad<input required value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} /></label>
        <label>Telefon<input required value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /></label>
        <label>İlçe<input value={customerForm.district} onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })} /></label>
        <label>Mahalle<input value={customerForm.neighborhood} onChange={(e) => setCustomerForm({ ...customerForm, neighborhood: e.target.value })} /></label>
        <button type="submit">Müşteri oluştur</button>
      </form>
      <form className="form-grid secondary-form" onSubmit={(e) => { e.preventDefault(); void createRecord("device", deviceForm, "Cihaz kaydedildi."); }}>
        <label>Müşteri<SelectCustomer customers={data.customers} value={deviceForm.customer_id} onChange={(value) => setDeviceForm({ ...deviceForm, customer_id: value })} /></label>
        <label>Cihaz türü<input value={deviceForm.device_type} onChange={(e) => setDeviceForm({ ...deviceForm, device_type: e.target.value })} /></label>
        <label>Marka<input value={deviceForm.brand} onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })} /></label>
        <label>Model<input value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} /></label>
        <button type="submit">Cihaz ekle</button>
      </form>
    </CrudCard>
  );
}

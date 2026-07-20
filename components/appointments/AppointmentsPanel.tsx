"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function AppointmentsPanel({ controller }: { controller: AdminController }) {
  const { data, appointmentForm, setAppointmentForm, createRecord } = controller;

  return (
    <CrudCard title="Randevular" items={data.appointments.map((item) => `${new Date(item.appointment_at).toLocaleString("tr-TR")} - ${item.status}`)}>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("appointment", appointmentForm, "Randevu kaydedildi."); }}>
        <SelectCustomer customers={data.customers} value={appointmentForm.customer_id} onChange={(value) => setAppointmentForm({ ...appointmentForm, customer_id: value })} />
        <select value={appointmentForm.job_id} onChange={(e) => setAppointmentForm({ ...appointmentForm, job_id: e.target.value })}>
          <option value="">İş seçin</option>
          {data.jobs.map((job) => <option value={job.id} key={job.id}>{job.title}</option>)}
        </select>
        <input type="datetime-local" value={appointmentForm.appointment_at} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_at: e.target.value })} />
        <input placeholder="Not" value={appointmentForm.note} onChange={(e) => setAppointmentForm({ ...appointmentForm, note: e.target.value })} />
        <button type="submit">Randevu oluştur</button>
      </form>
    </CrudCard>
  );
}

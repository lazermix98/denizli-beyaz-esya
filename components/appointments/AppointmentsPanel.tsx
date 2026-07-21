"use client";

import { CrudCard } from "../shared/RecordList";
import { SelectCustomer } from "../shared/SelectCustomer";
import type { AdminController } from "../../features/admin/hooks/useAdminController";

export function AppointmentsPanel({ controller }: { controller: AdminController }) {
  const { data, appointmentForm, setAppointmentForm, createRecord } = controller;
  const appointment = controller.sector.dictionary.appointment;

  return (
    <CrudCard
      title={appointment}
      description={`${appointment} planını müşteri ve iş akışıyla birlikte yönetin.`}
      items={data.appointments.map((item) => `${new Date(item.appointment_at).toLocaleString("tr-TR")} - ${item.note || "Randevu"} - ${item.status}`)}
      loading={controller.routeLoading}
      pagination={controller.pagination}
      onPageChange={controller.changePage}
      onPerPageChange={controller.changePerPage}
    >
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); void createRecord("appointment", appointmentForm, `${appointment} kaydedildi.`); }}>
        <label>{controller.sector.dictionary.customer}<SelectCustomer customers={data.customers} value={appointmentForm.customer_id} onChange={(value) => setAppointmentForm({ ...appointmentForm, customer_id: value })} /></label>
        <label>{controller.sector.dictionary.job}<select value={appointmentForm.job_id} onChange={(e) => setAppointmentForm({ ...appointmentForm, job_id: e.target.value })}>
          <option value="">{controller.sector.dictionary.job} seçin</option>
          {data.jobs.map((job) => <option value={job.id} key={job.id}>{job.title}</option>)}
        </select></label>
        <label>Tarih ve saat<input type="datetime-local" value={appointmentForm.appointment_at} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_at: e.target.value })} /></label>
        <label>Not<input value={appointmentForm.note} onChange={(e) => setAppointmentForm({ ...appointmentForm, note: e.target.value })} /></label>
        <button type="submit">Yeni {appointment.toLowerCase()} oluştur</button>
      </form>
    </CrudCard>
  );
}

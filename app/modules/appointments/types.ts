export type Appointment = {
  id: string;
  company_id: string;
  customer_id: string;
  job_id?: string;
  appointment_at: string;
  status: string;
  note?: string;
};

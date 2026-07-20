export type AdminSection =
  | "dashboard"
  | "customers"
  | "requests"
  | "appointments"
  | "work-records"
  | "devices"
  | "ai-content"
  | "whatsapp"
  | "pdf"
  | "settings";

export type Customer = { id: string; full_name: string; phone: string; district?: string; neighborhood?: string; created_at?: string };
export type RequestRow = { id: string; customer_id?: string; subject: string; description?: string; status: string; source?: string; created_at?: string };
export type Device = { id: string; customer_id: string; device_type: string; brand?: string; model?: string };
export type Job = { id: string; customer_id: string; title: string; description?: string; status: string; price?: number; warranty_until?: string };
export type Appointment = { id: string; customer_id: string; job_id?: string; appointment_at: string; status: string; note?: string };
export type Content = { id: string; content_type: string; topic: string; output: string; created_at?: string };
export type Template = { id: string; channel: string; title?: string; body: string };
export type SetupStatus = { ready: boolean; installed: boolean; missingEnv?: string[]; error?: string };

export type AdminData = {
  customers: Customer[];
  requests: RequestRow[];
  devices: Device[];
  jobs: Job[];
  appointments: Appointment[];
  content: Content[];
  templates: Template[];
};

export type DashboardSummary = {
  customerCount: number;
  openRequests: number;
  appointmentCount: number;
  openJobs: number;
  revenue: number;
};

export const emptyData: AdminData = {
  customers: [],
  requests: [],
  devices: [],
  jobs: [],
  appointments: [],
  content: [],
  templates: [],
};

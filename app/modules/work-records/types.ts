export type WorkRecord = {
  id: string;
  company_id: string;
  customer_id: string;
  request_id?: string;
  device_id?: string;
  title: string;
  description?: string;
  status: string;
  price?: number;
  warranty_until?: string;
  technician_notes?: string;
};

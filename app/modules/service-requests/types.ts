export type ServiceRequest = {
  id: string;
  company_id: string;
  customer_id?: string;
  source: string;
  subject: string;
  description?: string;
  status: string;
};

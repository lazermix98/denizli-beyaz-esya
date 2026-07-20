import type { StaffRole } from "../auth/types";

export type StaffUser = {
  id: string;
  company_id: string;
  email: string;
  role: StaffRole;
  is_active: boolean;
};

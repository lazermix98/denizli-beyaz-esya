export type StaffRole = "owner" | "admin" | "staff";

export type AdminSession = {
  sub: string;
  email: string;
  role: StaffRole;
  companyId: string;
  exp: number;
};

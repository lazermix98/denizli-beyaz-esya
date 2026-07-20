import type { AdminSection } from "../shared/types";

export const adminNav: { section: AdminSection; label: string; href: string; roles?: string[] }[] = [
  { section: "dashboard", label: "Dashboard", href: "/admin" },
  { section: "customers", label: "Müşteriler", href: "/admin/customers" },
  { section: "requests", label: "Talepler", href: "/admin/requests" },
  { section: "appointments", label: "Randevular", href: "/admin/appointments" },
  { section: "work-records", label: "İş kayıtları", href: "/admin/work-records" },
  { section: "devices", label: "Cihazlar", href: "/admin/devices" },
  { section: "ai-content", label: "AI içerik", href: "/admin/ai-content" },
  { section: "whatsapp", label: "WhatsApp", href: "/admin/whatsapp" },
  { section: "pdf", label: "PDF", href: "/admin/pdf" },
  { section: "settings", label: "Ayarlar", href: "/admin/settings", roles: ["owner", "admin"] },
];

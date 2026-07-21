import { adminNav } from "../../features/admin/navigation";
import { companySettings } from "../../features/settings/company";
import type { AdminSection } from "../../features/shared/types";

const descriptions: Record<AdminSection, string> = {
  dashboard: "Operasyon, talep, randevu ve gelir durumunu izleyin.",
  customers: "Müşteri kartları ve CRM kayıtları.",
  requests: "Yeni ve bekleyen talepler.",
  appointments: "Randevu planı ve saha akışı.",
  "work-records": "Servis ve iş kayıtları.",
  devices: "Cihaz, marka ve geçmiş bilgileri.",
  "ai-content": "AI içerik üretimi ve geçmişi.",
  whatsapp: "Hazır mesaj şablonları.",
  pdf: "PDF servis ve iş formları.",
  settings: "Firma ve kullanıcı ayarları.",
};

export function AdminTopbar({ active }: { active: AdminSection }) {
  const current = adminNav.find((item) => item.section === active);
  return (
    <nav className="admin-topbar">
      <div className="topbar-title">
        <span>{companySettings.referenceCompany}</span>
        <strong>{current?.label || "Dashboard"}</strong>
        <small>{descriptions[active]}</small>
      </div>
      <label className="topbar-search">
        <span>Arama</span>
        <input placeholder="Müşteri, talep veya iş ara" />
      </label>
      <div className="topbar-actions">
        <a href={`tel:${companySettings.phoneTel}`}>{companySettings.phoneDisplay}</a>
        <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" aria-label="Bildirimler">●</button>
      </div>
    </nav>
  );
}

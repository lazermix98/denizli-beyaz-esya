import { adminNav } from "../../features/admin/navigation";
import { companySettings } from "../../features/settings/company";
import type { SectorConfig } from "../../features/sectors/config";
import type { AdminSection } from "../../features/shared/types";

function sectionLabel(section: AdminSection, fallback: string, sector: SectorConfig) {
  if (section === "requests") return `${sector.dictionary.record}lar`;
  if (section === "work-records") return `${sector.dictionary.job} kayıtları`;
  if (section === "devices") return `${sector.dictionary.asset}lar`;
  if (section === "appointments") return sector.dictionary.appointment;
  return fallback;
}

export function AdminTopbar({ active, sector }: { active: AdminSection; sector: SectorConfig }) {
  const current = adminNav.find((item) => item.section === active);
  const title = sectionLabel(active, current?.label || "Dashboard", sector);

  return (
    <nav className="admin-topbar">
      <div className="topbar-title">
        <span>{companySettings.referenceCompany} / {sector.name}</span>
        <strong>{title}</strong>
        <small>{active === "dashboard" ? sector.dashboard.description : `${sector.dictionary.record}, ${sector.dictionary.job} ve ${sector.dictionary.asset} akışları tenant kapsamında yönetilir.`}</small>
      </div>
      <label className="topbar-search">
        <span>Arama</span>
        <input placeholder={`${sector.dictionary.customer}, ${sector.dictionary.record} veya ${sector.dictionary.job} ara`} />
      </label>
      <div className="topbar-actions">
        <a href={`tel:${companySettings.phoneTel}`}>{companySettings.phoneDisplay}</a>
        <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" aria-label="Bildirimler">•</button>
      </div>
    </nav>
  );
}

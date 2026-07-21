"use client";

import Link from "next/link";
import { adminNav } from "../../features/admin/navigation";
import { companySettings } from "../../features/settings/company";
import type { SectorConfig } from "../../features/sectors/config";
import type { AdminSection } from "../../features/shared/types";

const icons: Record<AdminSection, string> = {
  dashboard: "D",
  customers: "M",
  requests: "K",
  appointments: "R",
  "work-records": "İ",
  devices: "V",
  "ai-content": "AI",
  whatsapp: "W",
  pdf: "P",
  settings: "A",
};

function sectionLabel(section: AdminSection, fallback: string, sector: SectorConfig) {
  if (section === "requests") return `${sector.dictionary.record}lar`;
  if (section === "work-records") return `${sector.dictionary.job} kayıtları`;
  if (section === "devices") return `${sector.dictionary.asset}lar`;
  if (section === "appointments") return sector.dictionary.appointment;
  return fallback;
}

export function AdminNavigation({
  active,
  onRefresh,
  onTheme,
  onLogout,
  sector,
}: {
  active: AdminSection;
  onRefresh: () => void;
  onTheme: () => void;
  onLogout: () => void;
  sector: SectorConfig;
}) {
  const visibleNav = adminNav.filter((item) => sector.modules.includes(item.section));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">IA</span>
        <div>
          <strong>{companySettings.productName}</strong>
          <small>{sector.name}</small>
        </div>
      </div>
      <div className="nav-group">
        {visibleNav.map((item) => (
          <Link className={active === item.section ? "active nav-link" : "nav-link"} href={item.href} key={item.section}>
            <span aria-hidden="true">{icons[item.section]}</span>
            {sectionLabel(item.section, item.label, sector)}
          </Link>
        ))}
      </div>
      <div className="sidebar-actions">
        <div className="sidebar-profile">
          <span className="brand-mark small">DB</span>
          <div>
            <strong>Yönetici</strong>
            <small>{sector.dictionary.staff}</small>
          </div>
        </div>
        <button onClick={onRefresh} type="button">Verileri yenile</button>
        <button onClick={onTheme} type="button">Tema değiştir</button>
        <button onClick={onLogout} type="button">Çıkış</button>
      </div>
    </aside>
  );
}

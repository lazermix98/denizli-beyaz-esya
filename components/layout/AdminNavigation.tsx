"use client";

import Link from "next/link";
import { adminNav } from "../../features/admin/navigation";
import { companySettings } from "../../features/settings/company";
import type { AdminSection } from "../../features/shared/types";

const icons: Record<AdminSection, string> = {
  dashboard: "⌁",
  customers: "◌",
  requests: "□",
  appointments: "◇",
  "work-records": "▤",
  devices: "▧",
  "ai-content": "✦",
  whatsapp: "◍",
  pdf: "▣",
  settings: "⚙",
};

export function AdminNavigation({
  active,
  onRefresh,
  onTheme,
  onLogout,
}: {
  active: AdminSection;
  onRefresh: () => void;
  onTheme: () => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">IA</span>
        <div>
          <strong>{companySettings.productName}</strong>
          <small>{companySettings.referenceCompany}</small>
        </div>
      </div>
      <div className="nav-group">
        {adminNav.map((item) => (
          <Link className={active === item.section ? "active nav-link" : "nav-link"} href={item.href} key={item.section}>
            <span aria-hidden="true">{icons[item.section]}</span>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="sidebar-actions">
        <div className="sidebar-profile">
          <span className="brand-mark small">DB</span>
          <div>
            <strong>Yönetici</strong>
            <small>Owner hesabı</small>
          </div>
        </div>
        <button onClick={onRefresh} type="button">Verileri yenile</button>
        <button onClick={onTheme} type="button">Tema değiştir</button>
        <button onClick={onLogout} type="button">Çıkış</button>
      </div>
    </aside>
  );
}

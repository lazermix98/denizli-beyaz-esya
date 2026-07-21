"use client";

import Link from "next/link";
import { adminNav } from "../../features/admin/navigation";
import { companySettings } from "../../features/settings/company";
import type { AdminSection } from "../../features/shared/types";

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
          <small>SaaS operasyon paneli</small>
        </div>
      </div>
      <div className="nav-group">
        {adminNav.map((item) => (
          <Link className={active === item.section ? "active nav-link" : "nav-link"} href={item.href} key={item.section}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="sidebar-actions">
        <button onClick={onRefresh} type="button">Yenile</button>
        <button onClick={onTheme} type="button">Tema</button>
        <button onClick={onLogout} type="button">Çıkış</button>
      </div>
    </aside>
  );
}

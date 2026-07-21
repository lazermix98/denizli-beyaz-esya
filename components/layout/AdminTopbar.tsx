import { companySettings } from "../../features/settings/company";

export function AdminTopbar() {
  return (
    <nav className="site-nav admin-topbar">
      <div className="topbar-title">
        <span>Production</span>
        <strong>{companySettings.referenceCompany}</strong>
      </div>
      <div>
        <a href={`tel:${companySettings.phoneTel}`}>{companySettings.phoneDisplay}</a>
        <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </nav>
  );
}

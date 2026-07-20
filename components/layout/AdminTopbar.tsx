import { companySettings } from "../../features/settings/company";

export function AdminTopbar() {
  return (
    <nav className="site-nav admin-topbar">
      <strong>{companySettings.productName}</strong>
      <div>
        <a href={`tel:${companySettings.phoneTel}`}>{companySettings.phoneDisplay}</a>
        <a href={companySettings.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </nav>
  );
}

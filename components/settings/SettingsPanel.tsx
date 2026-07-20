import { RecordList } from "../shared/RecordList";
import { companySettings } from "../../features/settings/company";

export function SettingsPanel() {
  return (
    <RecordList
      title="Firma ayarları ve demo/referans"
      items={[
        companySettings.referenceCompany,
        companySettings.phoneDisplay,
        "Multi-tenant company_id altyapısı hazır",
        "Vercel standart .next build hazır",
      ]}
    />
  );
}

"use client";

import { LoginCard } from "../auth/LoginCard";
import { AiContentPanel } from "../ai-content/AiContentPanel";
import { AppointmentsPanel } from "../appointments/AppointmentsPanel";
import { CustomersPanel } from "../customers/CustomersPanel";
import { DashboardPanel } from "../dashboard/DashboardPanel";
import { DevicesPanel } from "../devices/DevicesPanel";
import { AdminPageShell } from "../layout/AdminPageShell";
import { PdfPanel } from "../pdf/PdfPanel";
import { RequestsPanel } from "../requests/RequestsPanel";
import { SettingsPanel } from "../settings/SettingsPanel";
import { SetupWizard } from "../setup/SetupWizard";
import { Spinner } from "../shared/Spinner";
import { StatusMessage } from "../shared/State";
import { WhatsAppTemplatesPanel } from "../whatsapp/WhatsAppTemplatesPanel";
import { WorkRecordsPanel } from "../work-records/WorkRecordsPanel";
import { useAdminController } from "../../features/admin/hooks/useAdminController";
import type { AdminSection } from "../../features/shared/types";

export function AdminApp({ section }: { section: AdminSection }) {
  const controller = useAdminController();

  if (!controller.ready) {
    return <main className="screen-loader"><Spinner /> Uygulama hazırlanıyor</main>;
  }

  if (controller.setupStatus && !controller.setupStatus.installed) {
    return <SetupWizard controller={controller} />;
  }

  if (!controller.authenticated) {
    return (
      <>
        <LoginCard controller={controller} />
        <StatusMessage message={controller.status} />
      </>
    );
  }

  return (
    <>
      <AdminPageShell active={section} controller={controller}>
        {section === "dashboard" && <DashboardPanel controller={controller} />}
        {section === "customers" && <CustomersPanel controller={controller} />}
        {section === "requests" && <RequestsPanel controller={controller} />}
        {section === "appointments" && <AppointmentsPanel controller={controller} />}
        {section === "work-records" && <WorkRecordsPanel controller={controller} />}
        {section === "devices" && <DevicesPanel controller={controller} />}
        {section === "ai-content" && <AiContentPanel controller={controller} />}
        {section === "whatsapp" && <WhatsAppTemplatesPanel controller={controller} />}
        {section === "pdf" && <PdfPanel controller={controller} />}
        {section === "settings" && <SettingsPanel />}
      </AdminPageShell>
      <StatusMessage message={controller.status} />
    </>
  );
}

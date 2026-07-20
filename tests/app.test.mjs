import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("uses standard Next.js and Vercel output", async () => {
  const [pkgText, nextConfig] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
  ]);
  const pkg = JSON.parse(pkgText);
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.dev, "next dev");
  assert.equal(pkg.scripts.start, "next start");
  assert.equal(pkg.scripts.setup, "node scripts/setup.mjs");
  assert.doesNotMatch(pkgText, /vinext|vite|wrangler|cloudflare/i);
  assert.doesNotMatch(nextConfig, /distDir|output/i);
  await assert.rejects(access(new URL("../vercel.json", import.meta.url)));
});

test("keeps secrets out and supports one-click setup", async () => {
  const [envExample, gitignore, supabase, setup, setupCore, setupRoute, page] = await Promise.all([
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup-core.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/api/setup/route.js", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(gitignore, /\.env\*/);
  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(envExample, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(envExample, /SUPABASE_DB_URL=/);
  assert.match(setup, /runSetup/);
  assert.match(setupCore, /db\/supabase-schema\.sql/);
  assert.match(setupCore, /pg_advisory_xact_lock/);
  assert.match(setupCore, /insert into setup_state/);
  assert.match(setupCore, /'owner'/);
  assert.match(setupRoute, /getSetupStatus/);
  assert.match(setupRoute, /Kurulum zaten tamamlan/);
  assert.match(setupRoute, /sessionCookie/);
  assert.doesNotMatch(envExample, /sk-[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{20,}/);
  assert.match(supabase, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(page, /SUPABASE_SERVICE_ROLE_KEY|service_role/i);
});

test("enforces auth roles and tenant-safe mutations", async () => {
  const [auth, records, supabase, schema] = await Promise.all([
    readFile(new URL("../app/lib/auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/records/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/supabase-schema.sql", import.meta.url), "utf8"),
  ]);
  assert.match(auth, /StaffRole/);
  assert.match(auth, /requireRole/);
  assert.match(auth, /"owner", "admin"/);
  assert.match(schema, /role in \('owner', 'admin', 'staff'\)/);
  assert.match(schema, /setup_state/);
  assert.match(schema, /current_tenant_company_id/);
  assert.match(schema, /authenticated tenant manages own customers/);
  assert.match(schema, /prevent_completed_setup_state_change/);
  assert.match(records, /requireUser\(request\)/);
  assert.match(records, /requireAdmin\(request\)/);
  assert.match(records, /session\.companyId/);
  assert.match(records, /updateTenantRow/);
  assert.match(records, /deleteTenantRow/);
  assert.match(supabase, /company_id=eq/);
});

test("hardens public form and login endpoints", async () => {
  const [publicRoute, loginRoute, resetRoute] = await Promise.all([
    readFile(new URL("../app/api/service-requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/password-reset/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(publicRoute, /checkRateLimit/);
  assert.match(publicRoute, /website/);
  assert.match(publicRoute, /cleanText/);
  assert.match(publicRoute, /isMobilePhone/);
  assert.doesNotMatch(publicRoute, /return Response\.json\(\{ ok: true, customer/);
  assert.match(loginRoute, /checkRateLimit/);
  assert.match(loginRoute, /Giriş bilgileri hatalı/);
  assert.doesNotMatch(loginRoute, /kullanıcı bulunamadı|hesap yok/i);
  assert.match(resetRoute, /Eğer hesap varsa/);
});

test("includes production product sections and module boundaries", async () => {
  const [
    page,
    publicHome,
    loginCard,
    adminApp,
    dashboard,
    customers,
    requests,
    appointments,
    workRecords,
    aiContent,
    whatsapp,
    pdf,
    settings,
    setupWizard,
    companySettings,
    architecture,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/PublicHome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/auth/LoginCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/AdminApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/dashboard/DashboardPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/customers/CustomersPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/requests/RequestsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/appointments/AppointmentsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/work-records/WorkRecordsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ai-content/AiContentPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/whatsapp/WhatsAppTemplatesPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/pdf/PdfPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/settings/SettingsPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/setup/SetupWizard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../features/settings/company.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/ARCHITECTURE.md", import.meta.url), "utf8"),
  ]);
  const frontend = [
    page,
    publicHome,
    loginCard,
    adminApp,
    dashboard,
    customers,
    requests,
    appointments,
    workRecords,
    aiContent,
    whatsapp,
    pdf,
    settings,
    setupWizard,
    companySettings,
  ].join("\n");
  assert.doesNotMatch(page, /use client/);
  assert.match(page, /PublicHome/);
  assert.match(adminApp, /DashboardPanel/);
  assert.match(adminApp, /CustomersPanel/);
  assert.match(adminApp, /RequestsPanel/);
  assert.match(adminApp, /AppointmentsPanel/);
  assert.match(adminApp, /WorkRecordsPanel/);
  assert.match(adminApp, /DevicesPanel/);
  assert.match(adminApp, /AiContentPanel/);
  assert.match(adminApp, /WhatsAppTemplatesPanel/);
  for (const text of [
    "Müşteri talep formu",
    "Güvenli admin girişi",
    "Müşteriler",
    "Talepler",
    "Randevular",
    "İş / servis kayıtları",
    "AI içerik üretim merkezi",
    "WhatsApp mesaj şablonları",
    "PDF rapor oluşturma",
    "Firma ayarları",
    "Denizli Beyaz Eşya Servisi",
    "905326397898",
    "Kurulumu Başlat",
  ]) {
    assert.match(frontend, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const domain of [
    "auth",
    "companies",
    "staff",
    "customers",
    "service-requests",
    "appointments",
    "work-records",
    "devices",
    "ai-content",
    "whatsapp-templates",
    "pdf",
    "settings",
    "shared",
  ]) {
    assert.match(architecture, new RegExp(`\`${domain}\``));
  }
  assert.doesNotMatch(frontend, /localStorage|demoCustomers|initialAppointments/);
});

test("creates stable admin routes", async () => {
  for (const route of [
    "../app/admin/page.tsx",
    "../app/admin/customers/page.tsx",
    "../app/admin/requests/page.tsx",
    "../app/admin/appointments/page.tsx",
    "../app/admin/work-records/page.tsx",
    "../app/admin/devices/page.tsx",
    "../app/admin/ai-content/page.tsx",
    "../app/admin/whatsapp/page.tsx",
    "../app/admin/settings/page.tsx",
  ]) {
    const content = await readFile(new URL(route, import.meta.url), "utf8");
    assert.match(content, /AdminApp/);
  }
});

test("loads admin data per route without the legacy bulk endpoint", async () => {
  await assert.rejects(access(new URL("../app/api/admin/data/route.ts", import.meta.url)));
  const [controller, summary, customers, requests, appointments, devices, jobs, ai, templates] = await Promise.all([
    readFile(new URL("../features/admin/hooks/useAdminController.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/summary/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/customers/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/appointments/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/devices/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/jobs/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/ai-content/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/templates/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(controller, /endpointBySection/);
  assert.doesNotMatch(controller, /\/api\/admin\/data/);
  assert.match(summary, /supabaseCount/);
  assert.doesNotMatch(summary, /select=\*/);
  for (const source of [customers, requests, appointments, devices, jobs, ai, templates]) {
    assert.match(source, /limit=25|limit=100/);
    assert.doesNotMatch(source, /select=\*/);
  }
});

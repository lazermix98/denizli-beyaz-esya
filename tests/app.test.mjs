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
  const [envExample, gitignore, supabase, setup, setupCore, setupRoute] = await Promise.all([
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/setup-core.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/api/setup/route.js", import.meta.url), "utf8"),
  ]);
  assert.match(gitignore, /\.env\*/);
  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(envExample, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(envExample, /SUPABASE_DB_URL=/);
  assert.match(setup, /runSetup/);
  assert.match(setupCore, /db\/supabase-schema\.sql/);
  assert.match(setupCore, /insert into staff_users/);
  assert.match(setupRoute, /runSetup/);
  assert.match(setupRoute, /sessionCookie/);
  assert.doesNotMatch(envExample, /sk-[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{20,}/);
  assert.match(supabase, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
});

test("includes production product sections and multi-tenant database", async () => {
  const [page, schema] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/supabase-schema.sql", import.meta.url), "utf8"),
  ]);
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
    assert.match(page, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(schema, /create table if not exists companies/);
  assert.match(schema, /company_id uuid not null/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /staff_users/);
  assert.doesNotMatch(page, /localStorage|demoCustomers|initialAppointments/);
});

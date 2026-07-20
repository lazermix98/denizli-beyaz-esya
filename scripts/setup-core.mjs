import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import pg from "pg";

const { Client } = pg;

export function loadEnvFile(file = resolve(".env.local")) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function databaseUrl() {
  return (
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  ).trim();
}

export function missingSetupEnv() {
  const required = [
    ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
    ["SUPABASE_DB_URL", databaseUrl()],
    ["AUTH_SECRET", process.env.AUTH_SECRET],
  ];
  return required.filter(([, value]) => !String(value || "").trim()).map(([name]) => name);
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function hashPassword(password) {
  const iterations = 210000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${base64Url(salt)}$${base64Url(hash)}`;
}

export function randomPassword() {
  return `${base64Url(randomBytes(18))}!A1`;
}

export function slugify(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "firma";
}

function client() {
  const url = databaseUrl();
  if (!url) {
    throw new Error(
      "Postgres bağlantı URL'si eksik. SUPABASE_DB_URL güvenli environment alanına eklenmeli."
    );
  }
  return new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
}

async function withClient(callback) {
  const db = client();
  await db.connect();
  try {
    return await callback(db);
  } finally {
    await db.end();
  }
}

export async function getSetupStatus() {
  loadEnvFile();
  const missing = missingSetupEnv();
  if (missing.length > 0) {
    return { ready: false, installed: false, missingEnv: missing, adminCount: 0, companyCount: 0 };
  }

  try {
    return await withClient(async (db) => {
      const exists = await db.query("select to_regclass('public.staff_users') as staff_table");
      if (!exists.rows[0]?.staff_table) {
        return { ready: true, installed: false, missingEnv: [], adminCount: 0, companyCount: 0 };
      }

      const counts = await db.query(`
        select
          (select count(*)::int from companies) as company_count,
          (select count(*)::int from staff_users where role in ('owner', 'admin') and is_active = true) as admin_count,
          coalesce((select completed from setup_state where key = 'initial_setup'), false) as setup_completed
      `);
      const companyCount = Number(counts.rows[0]?.company_count || 0);
      const adminCount = Number(counts.rows[0]?.admin_count || 0);
      const setupCompleted = Boolean(counts.rows[0]?.setup_completed);
      return {
        ready: true,
        installed: setupCompleted || (companyCount > 0 && adminCount > 0),
        missingEnv: [],
        adminCount,
        companyCount,
      };
    });
  } catch (error) {
    return {
      ready: false,
      installed: false,
      missingEnv: [],
      adminCount: 0,
      companyCount: 0,
      error: error instanceof Error ? error.message : "Veritabanı bağlantısı kurulamadı.",
    };
  }
}

export async function runSetup(input = {}) {
  loadEnvFile();
  const missing = missingSetupEnv();
  if (missing.length > 0) {
    throw new Error(`Eksik environment değişkenleri: ${missing.join(", ")}`);
  }

  const companyName = String(input.companyName || process.env.COMPANY_NAME || "Denizli Beyaz Eşya Servisi").trim();
  const phone = String(input.phone || process.env.COMPANY_PHONE || "0532 639 78 98").trim();
  const whatsapp = String(input.whatsapp || phone.replace(/\D/g, "").replace(/^0/, "90") || "905326397898").trim();
  const sector = String(input.sector || "Dijital işletme yönetimi ve servis otomasyonu").trim();
  const adminEmail = String(input.adminEmail || process.env.ADMIN_EMAIL || "admin@denizlibeyazesya.com").trim().toLowerCase();
  const generatedPassword = !input.adminPassword && !process.env.ADMIN_PASSWORD;
  const adminPassword = String(input.adminPassword || process.env.ADMIN_PASSWORD || randomPassword());
  const companySlug = slugify(String(input.companySlug || process.env.DEFAULT_COMPANY_SLUG || companyName));
  const migration = readFileSync(resolve("db/supabase-schema.sql"), "utf8");

  if (companyName.length < 2) throw new Error("Firma adı en az 2 karakter olmalı.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) throw new Error("Geçerli bir admin e-posta adresi girilmeli.");
  if (adminPassword.length < 8) throw new Error("Admin şifresi en az 8 karakter olmalı.");

  const result = await withClient(async (db) => {
    await db.query("begin");
    try {
      await db.query("select pg_advisory_xact_lock(741258963)");
      await db.query(migration);
      const existingSetup = await db.query("select completed from setup_state where key = 'initial_setup' for update");
      if (existingSetup.rows[0]?.completed) {
        throw new Error("Kurulum zaten tamamlanmış.");
      }
      const company = await db.query(
        `
        insert into companies (name, slug, phone, whatsapp, sector)
        values ($1, $2, $3, $4, $5)
        on conflict (slug) do update set
          name = excluded.name,
          phone = excluded.phone,
          whatsapp = excluded.whatsapp,
          sector = excluded.sector
        returning id, name, slug
        `,
        [companyName, companySlug, phone, whatsapp, sector]
      );
      const staff = await db.query(
        `
        insert into staff_users (company_id, email, password_hash, role, is_active)
        values ($1, $2, $3, 'owner', true)
        on conflict (email) do update set
          company_id = excluded.company_id,
          password_hash = excluded.password_hash,
          role = 'owner',
          is_active = true
        returning id, company_id, email, role
        `,
        [company.rows[0].id, adminEmail, hashPassword(adminPassword)]
      );
      await db.query(
        `
        insert into setup_state (key, completed, completed_at, company_id)
        values ('initial_setup', true, now(), $1)
        on conflict (key) do nothing
        `,
        [company.rows[0].id]
      );
      await db.query("commit");
      return { company: company.rows[0], admin: staff.rows[0] };
    } catch (error) {
      await db.query("rollback");
      throw error;
    }
  });

  return {
    ...result,
    generatedPassword,
    adminPassword: generatedPassword ? adminPassword : undefined,
  };
}

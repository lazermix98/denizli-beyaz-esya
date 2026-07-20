import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import pg from "pg";

const { Client } = pg;

function loadEnvFile(file) {
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

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} eksik.`);
  return value;
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hashPassword(password) {
  const iterations = 210000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${base64Url(salt)}$${base64Url(hash)}`;
}

function randomPassword() {
  return `${base64Url(randomBytes(18))}!A1`;
}

async function main() {
  loadEnvFile(resolve(".env.local"));

  const databaseUrl =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!databaseUrl) {
    throw new Error(
      "Postgres bağlantı URL'si eksik. .env.local veya Vercel secrets içine SUPABASE_DB_URL eklenmeli. Bu değer Supabase > Project Settings > Database > Connection string alanından alınır."
    );
  }

  required("NEXT_PUBLIC_SUPABASE_URL");
  required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  required("SUPABASE_SERVICE_ROLE_KEY");
  required("AUTH_SECRET");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@denizlibeyazesya.com";
  const generatedPassword = !process.env.ADMIN_PASSWORD;
  const adminPassword = process.env.ADMIN_PASSWORD || randomPassword();
  const companySlug = process.env.DEFAULT_COMPANY_SLUG || "denizli-beyaz-esya-servisi";
  const migration = readFileSync(resolve("db/supabase-schema.sql"), "utf8");

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query("begin");
    await client.query(migration);
    await client.query(
      `
      insert into staff_users (company_id, email, password_hash, role, is_active)
      select id, $1, $2, 'admin', true
      from companies
      where slug = $3
      on conflict (email) do update set
        password_hash = excluded.password_hash,
        role = 'admin',
        is_active = true
      `,
      [adminEmail.toLowerCase(), hashPassword(adminPassword), companySlug]
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  console.log("Setup tamamlandı.");
  console.log(`Firma slug: ${companySlug}`);
  console.log(`Admin e-posta: ${adminEmail}`);
  if (generatedPassword) {
    console.log(`Geçici admin şifresi: ${adminPassword}`);
    console.log("Bu şifreyi şimdi güvenli bir yere kaydedin. Tekrar gösterilmez.");
  } else {
    console.log("Admin şifresi ADMIN_PASSWORD environment değerinden alındı.");
  }
}

main().catch((error) => {
  console.error(`Setup başarısız: ${error.message}`);
  process.exit(1);
});

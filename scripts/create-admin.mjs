import { randomBytes, pbkdf2Sync } from "node:crypto";

const [, , email, password, companySlug = "denizli-beyaz-esya-servisi"] = process.argv;

if (!email || !password || password.length < 10) {
  console.error('Kullanım: node scripts/create-admin.mjs "admin@firma.com" "Guclu-Sifre-123" "firma-slug"');
  process.exit(1);
}

function base64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const iterations = 210000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const passwordHash = `pbkdf2_sha256$${iterations}$${base64Url(salt)}$${base64Url(hash)}`;

console.log(`insert into staff_users (company_id, email, password_hash, role, is_active)
select id, '${email.toLowerCase().replaceAll("'", "''")}', '${passwordHash}', 'admin', true
from companies
where slug = '${companySlug.replaceAll("'", "''")}'
on conflict (email) do update set
  password_hash = excluded.password_hash,
  role = 'admin',
  is_active = true;`);

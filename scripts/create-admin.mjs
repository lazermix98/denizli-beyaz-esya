import crypto from "node:crypto";

const [email, password] = process.argv.slice(2);

if (!email || !password || password.length < 10) {
  console.error("Kullanım: node scripts/create-admin.mjs admin@site.com 'Güçlü-Şifre-123'");
  console.error("Şifre en az 10 karakter olmalıdır.");
  process.exit(1);
}

const iterations = 210_000;
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
const encoded = `pbkdf2_sha256$${iterations}$${salt.toString("base64url")}$${hash.toString("base64url")}`;

console.log(`insert into admins (email, password_hash, role, is_demo)`);
console.log(
  `values ('${email.toLowerCase().replaceAll("'", "''")}', '${encoded}', 'admin', false);`
);

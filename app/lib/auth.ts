import { supabaseRequest } from "./supabase";

const cookieName = "dbes_session";
const encoder = new TextEncoder();

type AdminRow = {
  id: string;
  email: string;
  role: string;
  password_hash: string;
  is_demo: boolean;
};

function base64Url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function hmac(message: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET en az 32 karakter olmalıdır.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function createSession(admin: Pick<AdminRow, "id" | "email" | "role">) {
  const payload = base64Url(
    encoder.encode(
      JSON.stringify({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        exp: Date.now() + 1000 * 60 * 60 * 8,
      })
    )
  );
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.split("=")[1];

  if (!cookie) return null;
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature || signature !== (await hmac(payload))) return null;

  const session = JSON.parse(new TextDecoder().decode(fromBase64(payload))) as {
    sub: string;
    email: string;
    role: string;
    exp: number;
  };

  if (session.exp < Date.now()) return null;
  return session;
}

export async function requireAdmin(request: Request) {
  const session = await verifySession(request);
  if (!session || session.role !== "admin") {
    return Response.json({ error: "Yetkisiz erişim. Yönetici girişi gerekli." }, { status: 401 });
  }
  return session;
}

export function sessionCookie(token: string) {
  return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`;
}

export function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function findAdminByEmail(email: string) {
  const rows = await supabaseRequest<AdminRow[]>(
    `admins?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id,email,role,password_hash,is_demo&limit=1`,
    { method: "GET" }
  );
  return rows[0] ?? null;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, saltBase64, hashBase64] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256") return false;

  const iterations = Number(iterationsText);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64(saltBase64),
      iterations,
    },
    key,
    256
  );

  return base64Url(derived) === hashBase64;
}

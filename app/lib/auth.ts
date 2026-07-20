import { selectRows } from "./supabase";

const cookieName = "business_ai_session";
const encoder = new TextEncoder();

export type AdminSession = {
  sub: string;
  email: string;
  role: "admin" | "staff";
  companyId: string;
  exp: number;
};

type UserRow = {
  id: string;
  company_id: string;
  email: string;
  role: "admin" | "staff";
  password_hash: string;
  is_active: boolean;
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

async function sign(message: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET en az 32 karakter olmalıdır.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function createSession(user: Pick<UserRow, "id" | "company_id" | "email" | "role">) {
  const payload = base64Url(
    encoder.encode(
      JSON.stringify({
        sub: user.id,
        companyId: user.company_id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 1000 * 60 * 60 * 8,
      })
    )
  );
  return `${payload}.${await sign(payload)}`;
}

export async function verifySession(request: Request): Promise<AdminSession | null> {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.split("=")[1];

  if (!cookie) return null;
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature || signature !== (await sign(payload))) return null;

  const session = JSON.parse(new TextDecoder().decode(fromBase64(payload))) as AdminSession;
  if (session.exp < Date.now()) return null;
  return session;
}

export async function requireUser(request: Request) {
  const session = await verifySession(request);
  if (!session) {
    return Response.json({ error: "Yetkisiz erişim. Yönetici girişi gerekli." }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;
  if (session.role !== "admin") {
    return Response.json({ error: "Bu işlem için admin yetkisi gerekli." }, { status: 403 });
  }
  return session;
}

export function sessionCookie(token: string) {
  return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`;
}

export function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function findUserByEmail(email: string) {
  const rows = await selectRows<UserRow>(
    `staff_users?email=eq.${encodeURIComponent(email.toLowerCase())}&is_active=eq.true&select=id,company_id,email,role,password_hash,is_active&limit=1`
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

import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { selectRows, supabaseRequest } from "../../../lib/supabase";
import { cleanText, isEmail } from "../../../modules/shared/validation";

type StaffRow = {
  id: string;
  email: string;
};

function base64Url(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hashPassword(password: string) {
  const iterations = 210000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${base64Url(salt)}$${base64Url(hash)}`;
}

function isValidToken(value: string | null) {
  const expected = process.env.ADMIN_RESET_TOKEN;
  if (!value || !expected) return false;
  const received = Buffer.from(value);
  const stored = Buffer.from(expected);
  return received.length === stored.length && timingSafeEqual(received, stored);
}

export async function POST(request: Request) {
  if (!isValidToken(request.headers.get("x-admin-reset-token"))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const input = (await request.json()) as { email?: string; password?: string };
  const email = cleanText(input.email, 180).toLowerCase();
  const password = String(input.password || "");

  if (!isEmail(email) || password.length < 12) {
    return Response.json({ error: "Invalid reset payload." }, { status: 400 });
  }

  const users = await selectRows<StaffRow>(
    `staff_users?email=eq.${encodeURIComponent(email)}&select=id,email&limit=1`
  );
  if (!users[0]) {
    return Response.json({ error: "Admin user not found." }, { status: 404 });
  }

  await supabaseRequest(`staff_users?id=eq.${encodeURIComponent(users[0].id)}`, {
    method: "PATCH",
    body: JSON.stringify({ password_hash: hashPassword(password), is_active: true }),
  });

  return Response.json({ ok: true, email });
}

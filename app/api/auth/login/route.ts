import { createSession, findAdminByEmail, sessionCookie, verifyPassword } from "../../../lib/auth";
import { isDatabaseConfigured } from "../../../lib/supabase";

export const runtime = "edge";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json(
      { error: "Production veritabanı bağlı değil. Supabase environment değerlerini ayarlayın." },
      { status: 503 }
    );
  }

  const admin = await findAdminByEmail(email);
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return Response.json({ error: "Giriş bilgileri hatalı." }, { status: 401 });
  }

  const token = await createSession(admin);
  return Response.json(
    { ok: true, user: { email: admin.email, role: admin.role, isDemo: admin.is_demo } },
    { headers: { "Set-Cookie": sessionCookie(token) } }
  );
}

import { createSession, findUserByEmail, sessionCookie, verifyPassword } from "../../../lib/auth";
import { isSupabaseConfigured } from "../../../lib/supabase";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return Response.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Supabase bağlantısı eksik. Environment değişkenlerini kontrol edin." }, { status: 503 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return Response.json({ error: "Giriş bilgileri hatalı." }, { status: 401 });
  }

  const token = await createSession(user);
  return Response.json(
    { ok: true, user: { email: user.email, role: user.role, companyId: user.company_id } },
    { headers: { "Set-Cookie": sessionCookie(token) } }
  );
}

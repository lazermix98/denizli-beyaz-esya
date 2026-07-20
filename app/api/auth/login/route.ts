import { createSession, findUserByEmail, sessionCookie, verifyPassword } from "../../../lib/auth";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { clientIp, checkRateLimit } from "../../../modules/shared/server/rate-limit";
import { cleanText } from "../../../modules/shared/validation";

export async function POST(request: Request) {
  const input = (await request.json()) as { email?: string; password?: string };
  const email = cleanText(input.email, 180).toLowerCase();
  const password = String(input.password || "");
  const key = `login:${clientIp(request)}:${email || "empty"}`;
  const limit = checkRateLimit(key, 5, 10 * 60 * 1000);

  if (!limit.allowed) {
    return Response.json({ error: "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  if (!email || !password) {
    return Response.json({ error: "Giriş bilgileri hatalı." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Sistem yapılandırması eksik. Lütfen environment ayarlarını kontrol edin." }, { status: 503 });
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

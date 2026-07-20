import { clientIp, checkRateLimit } from "../../../modules/shared/server/rate-limit";
import { cleanText, isEmail } from "../../../modules/shared/validation";

export async function POST(request: Request) {
  const limit = checkRateLimit(`password-reset:${clientIp(request)}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json({ error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = cleanText(body.email, 180).toLowerCase();
  } catch {
    return Response.json({ ok: true, message: "Eğer hesap varsa şifre sıfırlama talimatı gönderilecektir." });
  }

  if (email && !isEmail(email)) {
    return Response.json({ ok: true, message: "Eğer hesap varsa şifre sıfırlama talimatı gönderilecektir." });
  }

  return Response.json({
    ok: true,
    message: "Eğer hesap varsa şifre sıfırlama talimatı gönderilecektir.",
  });
}

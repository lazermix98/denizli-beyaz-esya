import { createSession, sessionCookie } from "../../lib/auth";
import { getSetupStatus, runSetup } from "../../../scripts/setup-core.mjs";

export const runtime = "nodejs";

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `9${digits}`;
  if (digits.startsWith("5")) return `90${digits}`;
  return digits;
}

export async function GET() {
  const status = await getSetupStatus();
  return Response.json(status);
}

export async function POST(request) {
  const status = await getSetupStatus();
  if (status.installed) {
    return Response.json({ error: "Kurulum zaten tamamlanmış." }, { status: 409 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Kurulum formu okunamadı." }, { status: 400 });
  }

  const companyName = String(body.companyName || "").trim();
  const phone = String(body.phone || "").trim();
  const sectorKey = String(body.sectorKey || "technical_service").trim();
  const adminEmail = String(body.adminEmail || "").trim().toLowerCase();
  const adminPassword = String(body.adminPassword || "");

  if (companyName.length < 2) {
    return Response.json({ error: "Firma adı en az 2 karakter olmalı." }, { status: 400 });
  }
  if (!/^0?5\d{9}$/.test(phone.replace(/\s/g, ""))) {
    return Response.json({ error: "Telefon numarası 05 ile başlayan geçerli bir mobil numara olmalı." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    return Response.json({ error: "Geçerli bir admin e-posta adresi girin." }, { status: 400 });
  }
  if (adminPassword.length < 8) {
    return Response.json({ error: "Admin şifresi en az 8 karakter olmalı." }, { status: 400 });
  }

  try {
    const result = await runSetup({
      companyName,
      phone,
      whatsapp: normalizePhone(phone),
      sector: sectorKey,
      adminEmail,
      adminPassword,
    });
    const token = await createSession({
      id: result.admin.id,
      company_id: result.admin.company_id,
      email: result.admin.email,
      role: result.admin.role,
    });
    return Response.json(
      {
        ok: true,
        company: result.company,
        adminEmail: result.admin.email,
        message: "Kurulum tamamlandı. Admin paneli hazır.",
      },
      { headers: { "Set-Cookie": sessionCookie(token) } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kurulum tamamlanamadı.";
    const statusCode = message.includes("zaten tamam") ? 409 : 500;
    return Response.json({ error: message }, { status: statusCode });
  }
}

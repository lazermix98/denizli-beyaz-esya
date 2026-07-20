import { requireAdmin, requireUser } from "../../../lib/auth";
import { deleteTenantRow, insertRow, updateTenantRow } from "../../../lib/supabase";
import { cleanText, isMobilePhone } from "../../../modules/shared/validation";

type RecordKind = "customer" | "request" | "device" | "job" | "appointment" | "template";

const tables: Record<RecordKind, string> = {
  customer: "customers",
  request: "requests",
  device: "devices",
  job: "jobs",
  appointment: "appointments",
  template: "message_templates",
};

function clean(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function payloadFor(kind: RecordKind, companyId: string, input: Record<string, unknown>) {
  if (kind === "customer") {
    const payload = {
      company_id: companyId,
      full_name: cleanText(input.full_name, 120),
      phone: cleanText(input.phone, 32),
      email: cleanText(input.email, 160),
      district: cleanText(input.district, 80),
      neighborhood: cleanText(input.neighborhood, 100),
      address: cleanText(input.address, 300),
    };
    if (payload.full_name.length < 3) throw new Error("Müşteri adı en az 3 karakter olmalıdır.");
    if (!isMobilePhone(payload.phone)) throw new Error("Geçerli cep telefonu girin.");
    return clean(payload);
  }

  if (kind === "request") {
    const payload = {
      company_id: companyId,
      customer_id: cleanText(input.customer_id, 80),
      source: cleanText(input.source, 40) || "admin",
      subject: cleanText(input.subject, 160),
      description: cleanText(input.description, 1000),
      status: cleanText(input.status, 40) || "new",
    };
    if (payload.subject.length < 3) throw new Error("Talep konusu zorunludur.");
    return clean(payload);
  }

  if (kind === "device") {
    const payload = {
      company_id: companyId,
      customer_id: cleanText(input.customer_id, 80),
      device_type: cleanText(input.device_type, 80),
      brand: cleanText(input.brand, 80),
      model: cleanText(input.model, 80),
      notes: cleanText(input.notes, 500),
    };
    if (!payload.customer_id) throw new Error("Cihaz için müşteri seçin.");
    if (payload.device_type.length < 2) throw new Error("Cihaz türü zorunludur.");
    return clean(payload);
  }

  if (kind === "job") {
    const payload = {
      company_id: companyId,
      customer_id: cleanText(input.customer_id, 80),
      request_id: cleanText(input.request_id, 80),
      device_id: cleanText(input.device_id, 80),
      title: cleanText(input.title, 160),
      description: cleanText(input.description, 1000),
      status: cleanText(input.status, 40) || "open",
      price: Number(input.price || 0),
      warranty_until: cleanText(input.warranty_until, 40),
      technician_notes: cleanText(input.technician_notes, 1000),
    };
    if (!payload.customer_id) throw new Error("İş kaydı için müşteri seçin.");
    if (payload.title.length < 3) throw new Error("İş başlığı zorunludur.");
    return clean(payload);
  }

  if (kind === "appointment") {
    const payload = {
      company_id: companyId,
      job_id: cleanText(input.job_id, 80),
      customer_id: cleanText(input.customer_id, 80),
      appointment_at: cleanText(input.appointment_at, 80),
      status: cleanText(input.status, 40) || "scheduled",
      note: cleanText(input.note, 500),
    };
    if (!payload.customer_id) throw new Error("Randevu için müşteri seçin.");
    if (!payload.appointment_at || Number.isNaN(Date.parse(payload.appointment_at))) {
      throw new Error("Geçerli bir randevu tarihi girin.");
    }
    return clean(payload);
  }

  const payload = {
    company_id: companyId,
    channel: cleanText(input.channel, 80),
    title: cleanText(input.title, 120),
    body: cleanText(input.body, 1000),
  };
  if (payload.channel.length < 2 || payload.body.length < 5) throw new Error("Şablon kanalı ve metni zorunludur.");
  return clean(payload);
}

async function parse(request: Request) {
  const body = (await request.json()) as { kind?: RecordKind; id?: string; data?: Record<string, unknown> };
  if (!body.kind || !tables[body.kind]) throw new Error("Geçersiz kayıt türü.");
  return { kind: body.kind, id: body.id, data: body.data || {} };
}

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  try {
    const body = await parse(request);
    const row = await insertRow(tables[body.kind], payloadFor(body.kind, session.companyId, body.data));
    return Response.json({ ok: true, row }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt oluşturulamadı." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Güncellenecek kayıt bulunamadı.");
    const row = await updateTenantRow(tables[body.kind], body.id, session.companyId, payloadFor(body.kind, session.companyId, body.data));
    if (!row) return Response.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    return Response.json({ ok: true, row });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt güncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (session instanceof Response) return session;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Silinecek kayıt bulunamadı.");
    await deleteTenantRow(tables[body.kind], body.id, session.companyId);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt silinemedi." }, { status: 400 });
  }
}

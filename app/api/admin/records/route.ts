import { requireUser } from "../../../lib/auth";
import { deleteRow, insertRow, updateRow } from "../../../lib/supabase";

type RecordKind = "customer" | "request" | "device" | "job" | "appointment" | "template";

const tables: Record<RecordKind, string> = {
  customer: "customers",
  request: "requests",
  device: "devices",
  job: "jobs",
  appointment: "appointments",
  template: "message_templates",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clean(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function payloadFor(kind: RecordKind, companyId: string, input: Record<string, unknown>) {
  if (kind === "customer") {
    const payload = {
      company_id: companyId,
      full_name: text(input.full_name),
      phone: text(input.phone),
      email: text(input.email),
      district: text(input.district),
      neighborhood: text(input.neighborhood),
      address: text(input.address),
    };
    if (payload.full_name.length < 3) throw new Error("Müşteri adı en az 3 karakter olmalıdır.");
    if (!/^0?5\d{9}$/.test(payload.phone.replace(/\s/g, ""))) throw new Error("Geçerli cep telefonu girin.");
    return clean(payload);
  }

  if (kind === "request") {
    const payload = {
      company_id: companyId,
      customer_id: text(input.customer_id),
      source: text(input.source) || "admin",
      subject: text(input.subject),
      description: text(input.description),
      status: text(input.status) || "new",
    };
    if (payload.subject.length < 3) throw new Error("Talep konusu zorunludur.");
    return clean(payload);
  }

  if (kind === "device") {
    const payload = {
      company_id: companyId,
      customer_id: text(input.customer_id),
      device_type: text(input.device_type),
      brand: text(input.brand),
      model: text(input.model),
      notes: text(input.notes),
    };
    if (!payload.customer_id) throw new Error("Cihaz için müşteri seçin.");
    if (payload.device_type.length < 2) throw new Error("Cihaz türü zorunludur.");
    return clean(payload);
  }

  if (kind === "job") {
    const payload = {
      company_id: companyId,
      customer_id: text(input.customer_id),
      request_id: text(input.request_id),
      device_id: text(input.device_id),
      title: text(input.title),
      description: text(input.description),
      status: text(input.status) || "open",
      price: Number(input.price || 0),
      warranty_until: text(input.warranty_until),
      technician_notes: text(input.technician_notes),
    };
    if (!payload.customer_id) throw new Error("İş kaydı için müşteri seçin.");
    if (payload.title.length < 3) throw new Error("İş başlığı zorunludur.");
    return clean(payload);
  }

  if (kind === "appointment") {
    const payload = {
      company_id: companyId,
      job_id: text(input.job_id),
      customer_id: text(input.customer_id),
      appointment_at: text(input.appointment_at),
      status: text(input.status) || "scheduled",
      note: text(input.note),
    };
    if (!payload.customer_id) throw new Error("Randevu için müşteri seçin.");
    if (!payload.appointment_at || Number.isNaN(Date.parse(payload.appointment_at))) {
      throw new Error("Geçerli bir randevu tarihi girin.");
    }
    return clean(payload);
  }

  const payload = {
    company_id: companyId,
    channel: text(input.channel),
    title: text(input.title),
    body: text(input.body),
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
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Güncellenecek kayıt bulunamadı.");
    const row = await updateRow(tables[body.kind], body.id, payloadFor(body.kind, session.companyId, body.data));
    return Response.json({ ok: true, row });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt güncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Silinecek kayıt bulunamadı.");
    await deleteRow(tables[body.kind], body.id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt silinemedi." }, { status: 400 });
  }
}

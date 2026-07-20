import { requireAdmin } from "../../../lib/auth";
import { deleteAdminRow, insertAdminRow, updateAdminRow } from "../../../lib/supabase";

export const runtime = "edge";

type RecordKind = "customer" | "device" | "service" | "appointment";

const tableByKind: Record<RecordKind, string> = {
  customer: "customers",
  device: "devices",
  service: "service_records",
  appointment: "appointments",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function compact(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
}

function buildPayload(kind: RecordKind, input: Record<string, unknown>) {
  if (kind === "customer") {
    const payload = {
      full_name: text(input.full_name),
      phone: text(input.phone),
      district: text(input.district),
      neighborhood: text(input.neighborhood),
      address: text(input.address),
    };
    if (payload.full_name.length < 3) throw new Error("Müşteri adı en az 3 karakter olmalı.");
    if (!/^0?5\d{9}$/.test(payload.phone.replace(/\s/g, ""))) throw new Error("Geçerli bir cep telefonu girin.");
    if (payload.district.length < 2) throw new Error("İlçe zorunludur.");
    return compact(payload);
  }

  if (kind === "device") {
    const payload = {
      customer_id: text(input.customer_id),
      device_type: text(input.device_type),
      brand: text(input.brand),
      model: text(input.model),
      notes: text(input.notes),
    };
    if (!payload.customer_id) throw new Error("Cihaz için müşteri seçin.");
    if (payload.device_type.length < 2) throw new Error("Cihaz türü zorunludur.");
    if (payload.brand.length < 2) throw new Error("Marka zorunludur.");
    return compact(payload);
  }

  if (kind === "service") {
    const payload = {
      customer_id: text(input.customer_id),
      device_id: text(input.device_id),
      service_type: text(input.service_type),
      problem_summary: text(input.problem_summary),
      status: text(input.status) || "new",
      technician_notes: text(input.technician_notes),
      operation_summary: text(input.operation_summary),
      warranty_until: text(input.warranty_until),
      appointment_at: text(input.appointment_at),
    };
    if (!payload.customer_id) throw new Error("Servis kaydı için müşteri seçin.");
    if (payload.service_type.length < 2) throw new Error("Servis türü zorunludur.");
    if (payload.problem_summary.length < 4) throw new Error("Arıza özeti en az 4 karakter olmalı.");
    return compact(payload);
  }

  const payload = {
    service_record_id: text(input.service_record_id),
    technician_name: text(input.technician_name),
    appointment_at: text(input.appointment_at),
    status: text(input.status) || "scheduled",
  };
  if (!payload.service_record_id) throw new Error("Randevu için servis kaydı seçin.");
  if (!payload.appointment_at || Number.isNaN(Date.parse(payload.appointment_at))) {
    throw new Error("Geçerli bir randevu tarihi girin.");
  }
  return compact(payload);
}

type ParsedBody = {
  kind: RecordKind;
  id?: string;
  data?: Record<string, unknown>;
};

async function parse(request: Request): Promise<ParsedBody> {
  const body = (await request.json()) as { kind?: RecordKind; id?: string; data?: Record<string, unknown> };
  if (!body.kind || !tableByKind[body.kind]) throw new Error("Geçersiz kayıt türü.");
  return { kind: body.kind, id: body.id, data: body.data };
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await parse(request);
    const row = await insertAdminRow(tableByKind[body.kind], buildPayload(body.kind, body.data || {}));
    return Response.json({ ok: true, row }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt oluşturulamadı." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Güncellenecek kayıt bulunamadı.");
    const row = await updateAdminRow(tableByKind[body.kind], body.id, buildPayload(body.kind, body.data || {}));
    return Response.json({ ok: true, row });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt güncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await parse(request);
    if (!body.id) throw new Error("Silinecek kayıt bulunamadı.");
    await deleteAdminRow(tableByKind[body.kind], body.id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Kayıt silinemedi." }, { status: 400 });
  }
}

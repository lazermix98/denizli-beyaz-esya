import { insertOne } from "../../lib/supabase";

export const runtime = "edge";

const recentSubmissions = new Map<string, number>();

type ServiceRequest = {
  fullName?: string;
  phone?: string;
  device?: string;
  brand?: string;
  fault?: string;
  district?: string;
  neighborhood?: string;
  description?: string;
};

function validate(input: ServiceRequest) {
  const errors: Record<string, string> = {};
  if (!input.fullName || input.fullName.trim().length < 3) errors.fullName = "Ad soyad en az 3 karakter olmalı.";
  if (!input.phone || !/^0?5\d{9}$/.test(input.phone.replace(/\s/g, ""))) errors.phone = "Geçerli cep telefonu girin.";
  if (!input.device || input.device.trim().length < 2) errors.device = "Cihaz zorunludur.";
  if (!input.brand || input.brand.trim().length < 2) errors.brand = "Marka zorunludur.";
  if (!input.fault || input.fault.trim().length < 4) errors.fault = "Arıza bilgisi zorunludur.";
  if (!input.district || input.district.trim().length < 2) errors.district = "İlçe zorunludur.";
  if (!input.neighborhood || input.neighborhood.trim().length < 2) errors.neighborhood = "Mahalle zorunludur.";
  if (!input.description || input.description.trim().length < 8) errors.description = "Açıklama en az 8 karakter olmalı.";
  return errors;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const last = recentSubmissions.get(ip) || 0;
  if (Date.now() - last < 30_000) {
    return Response.json({ error: "Çok sık gönderim yapıldı. Lütfen 30 saniye bekleyin." }, { status: 429 });
  }

  const input = (await request.json()) as ServiceRequest;
  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Form doğrulaması başarısız.", errors }, { status: 400 });
  }

  try {
    const customer = await insertOne("customers", {
      full_name: input.fullName,
      phone: input.phone,
      district: input.district,
      neighborhood: input.neighborhood,
    });

    const device = await insertOne("devices", {
      customer_id: customer.id,
      device_type: input.device,
      brand: input.brand,
      notes: input.description,
    });

    const service = await insertOne("service_records", {
      customer_id: customer.id,
      device_id: device.id,
      service_type: input.device,
      problem_summary: input.fault,
      status: "new",
      technician_notes: input.description,
    });

    recentSubmissions.set(ip, Date.now());
    return Response.json({ ok: true, customer, device, service }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Servis talebi veritabanına kaydedilemedi.",
      },
      { status: 503 }
    );
  }
}

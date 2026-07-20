import { insertRow, selectRows } from "../../lib/supabase";

const recentSubmissions = new Map<string, number>();

type PublicRequest = {
  fullName?: string;
  phone?: string;
  service?: string;
  district?: string;
  neighborhood?: string;
  description?: string;
};

type CompanyRow = { id: string };
type CustomerRow = { id: string };

function cleanPhone(phone: string) {
  return phone.replace(/\s/g, "");
}

function validate(input: PublicRequest) {
  const errors: Record<string, string> = {};
  if (!input.fullName || input.fullName.trim().length < 3) errors.fullName = "Ad soyad en az 3 karakter olmalıdır.";
  if (!input.phone || !/^0?5\d{9}$/.test(cleanPhone(input.phone))) errors.phone = "Geçerli cep telefonu girin.";
  if (!input.service || input.service.trim().length < 2) errors.service = "Hizmet türü zorunludur.";
  if (!input.district || input.district.trim().length < 2) errors.district = "İlçe zorunludur.";
  if (!input.neighborhood || input.neighborhood.trim().length < 2) errors.neighborhood = "Mahalle zorunludur.";
  if (!input.description || input.description.trim().length < 8) errors.description = "Açıklama en az 8 karakter olmalıdır.";
  return errors;
}

async function defaultCompanyId() {
  const slug = process.env.DEFAULT_COMPANY_SLUG || "denizli-beyaz-esya-servisi";
  const rows = await selectRows<CompanyRow>(`companies?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`);
  if (!rows[0]) throw new Error("Varsayılan firma bulunamadı. Migration ve firma kaydını kontrol edin.");
  return rows[0].id;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const last = recentSubmissions.get(ip) || 0;
  if (Date.now() - last < 30_000) {
    return Response.json({ error: "Çok sık gönderim yapıldı. Lütfen 30 saniye bekleyin." }, { status: 429 });
  }

  const input = (await request.json()) as PublicRequest;
  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Form doğrulaması başarısız.", errors }, { status: 400 });
  }

  try {
    const companyId = await defaultCompanyId();
    const customer = await insertRow<CustomerRow>("customers", {
      company_id: companyId,
      full_name: input.fullName!.trim(),
      phone: input.phone!.trim(),
      district: input.district!.trim(),
      neighborhood: input.neighborhood!.trim(),
    });

    const requestRow = await insertRow("requests", {
      company_id: companyId,
      customer_id: customer.id,
      source: "website",
      subject: input.service!.trim(),
      description: input.description!.trim(),
      status: "new",
    });

    recentSubmissions.set(ip, Date.now());
    return Response.json({ ok: true, customer, request: requestRow }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Talep veritabanına kaydedilemedi." },
      { status: 503 }
    );
  }
}

import { insertRow, selectRows } from "../../lib/supabase";
import { clientIp, checkRateLimit } from "../../modules/shared/server/rate-limit";
import { cleanText, isMobilePhone } from "../../modules/shared/validation";

type PublicRequest = {
  fullName?: string;
  phone?: string;
  service?: string;
  district?: string;
  neighborhood?: string;
  description?: string;
  companySlug?: string;
  website?: string;
};

type CompanyRow = { id: string };
type CustomerRow = { id: string };

function validate(input: PublicRequest) {
  const cleaned = {
    fullName: cleanText(input.fullName, 120),
    phone: cleanText(input.phone, 32),
    service: cleanText(input.service, 160),
    district: cleanText(input.district, 80),
    neighborhood: cleanText(input.neighborhood, 100),
    description: cleanText(input.description, 1000),
    companySlug: cleanText(input.companySlug || process.env.DEFAULT_COMPANY_SLUG || "denizli-beyaz-esya-servisi", 120),
    website: cleanText(input.website, 120),
  };

  const errors: Record<string, string> = {};
  if (cleaned.website) errors.website = "Spam koruması tetiklendi.";
  if (cleaned.fullName.length < 3) errors.fullName = "Ad soyad en az 3 karakter olmalıdır.";
  if (!isMobilePhone(cleaned.phone)) errors.phone = "Geçerli cep telefonu girin.";
  if (cleaned.service.length < 2) errors.service = "Hizmet türü zorunludur.";
  if (cleaned.district.length < 2) errors.district = "İlçe zorunludur.";
  if (cleaned.neighborhood.length < 2) errors.neighborhood = "Mahalle zorunludur.";
  if (cleaned.description.length < 8) errors.description = "Açıklama en az 8 karakter olmalıdır.";
  return { cleaned, errors };
}

async function companyId(slug: string) {
  const rows = await selectRows<CompanyRow>(`companies?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`);
  if (!rows[0]) throw new Error("Firma bulunamadı. Kurulum durumunu kontrol edin.");
  return rows[0].id;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`public-request:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json({ error: "Çok sık gönderim yapıldı. Lütfen biraz sonra tekrar deneyin." }, { status: 429 });
  }

  let input: PublicRequest;
  try {
    input = (await request.json()) as PublicRequest;
  } catch {
    return Response.json({ error: "Form verisi okunamadı." }, { status: 400 });
  }

  const { cleaned, errors } = validate(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "Form doğrulaması başarısız.", errors }, { status: 400 });
  }

  try {
    const targetCompanyId = await companyId(cleaned.companySlug);
    const customer = await insertRow<CustomerRow>("customers", {
      company_id: targetCompanyId,
      full_name: cleaned.fullName,
      phone: cleaned.phone,
      district: cleaned.district,
      neighborhood: cleaned.neighborhood,
    });

    await insertRow("requests", {
      company_id: targetCompanyId,
      customer_id: customer.id,
      source: "website",
      subject: cleaned.service,
      description: cleaned.description,
      status: "new",
    });

    return Response.json({ ok: true, message: "Talebiniz alındı." }, { status: 201 });
  } catch {
    return Response.json({ error: "Talep şu anda kaydedilemedi. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  }
}

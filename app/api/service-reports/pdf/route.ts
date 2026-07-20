import { requireAdmin } from "../../../lib/auth";

export const runtime = "edge";

function line(value: string) {
  return value.replace(/[()\\]/g, "");
}

function buildPdf(lines: string[]) {
  const body = lines.map((item, index) => `BT /F1 11 Tf 48 ${760 - index * 24} Td (${line(item)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const payload = (await request.json()) as Record<string, string>;
  const required = ["customer", "device", "fault", "operation", "part", "price", "warranty"];
  const missing = required.filter((field) => !payload[field]?.trim());
  if (missing.length > 0) {
    return Response.json({ error: "PDF için eksik alan var.", missing }, { status: 400 });
  }

  const pdf = buildPdf([
    "Denizli Beyaz Esya Servisi",
    "Telefon: 0532 639 78 98",
    `Musteri: ${payload.customer}`,
    `Cihaz: ${payload.device}`,
    `Ariza: ${payload.fault}`,
    `Islem: ${payload.operation}`,
    `Parca: ${payload.part}`,
    `Ucret: ${payload.price}`,
    `Garanti: ${payload.warranty}`,
    "Musteri imzasi: ____________________",
    "Teknisyen imzasi: __________________",
  ]);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="denizli-beyaz-esya-servis-fisi.pdf"',
    },
  });
}

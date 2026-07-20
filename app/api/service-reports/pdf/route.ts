import { requireUser } from "../../../lib/auth";

function safeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/[()\\]/g, "");
}

function pdf(lines: string[]) {
  const body = lines.map((line, index) => `BT /F1 11 Tf 48 ${780 - index * 24} Td (${safeText(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`,
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(output.length);
    output += `${object}\n`;
  }
  const xref = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  output += `trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xref}\n%%EOF`;
  return output;
}

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const payload = (await request.json()) as Record<string, string>;
  const required = ["customer", "title", "description", "price", "warranty"];
  const missing = required.filter((field) => !payload[field]?.trim());
  if (missing.length > 0) {
    return Response.json({ error: "PDF için eksik alan var.", missing }, { status: 400 });
  }

  const content = pdf([
    "Isletme AI Otomasyon - Is / Servis Formu",
    "Demo firma: Denizli Beyaz Esya Servisi",
    "Telefon: 0532 639 78 98",
    `Musteri: ${payload.customer}`,
    `Is / Servis: ${payload.title}`,
    `Aciklama: ${payload.description}`,
    `Ucret: ${payload.price}`,
    `Garanti: ${payload.warranty}`,
    "Musteri imzasi: ____________________",
    "Yetkili imzasi: _____________________",
  ]);

  return new Response(content, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="isletme-ai-servis-formu.pdf"',
    },
  });
}

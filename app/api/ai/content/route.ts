import { requireAdmin } from "../../../lib/auth";
import { insertOne, isDatabaseConfigured } from "../../../lib/supabase";

export const runtime = "edge";

type AiRequest = {
  type?: string;
  topic?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { type = "Google İşletme gönderisi", topic = "Denizli beyaz eşya servisi" } =
    (await request.json()) as AiRequest;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OpenAI API anahtarı eksik. OPENAI_API_KEY sunucu environment değerini ayarlayın." },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "Denizli Beyaz Eşya Servisi için Türkçe, güven veren, yerel SEO uyumlu ve abartısız servis sektörü içerikleri yaz. Telefonu her metinde doğal biçimde geçir: 0532 639 78 98.",
        },
        {
          role: "user",
          content: `İçerik türü: ${type}\nKonu: ${topic}\nHizmet bölgesi: Denizli ve Pamukkale\nÇalışma saatleri: Pazartesi-Cumartesi 08:00-18:00`,
        },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    return Response.json(
      { error: `OpenAI yanıtı alınamadı. Durum: ${response.status}` },
      { status: response.status === 429 ? 429 : 502 }
    );
  }

  const data = await response.json();
  const content =
    data.output_text ||
    data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content || [])
      .map((item: { text?: string }) => item.text)
      .filter(Boolean)
      .join("\n");

  if (!content) {
    return Response.json({ error: "OpenAI boş içerik döndürdü." }, { status: 502 });
  }

  let saved = null;
  if (isDatabaseConfigured()) {
    saved = await insertOne("ai_content_items", {
      content_type: type,
      topic,
      output: content,
      channel: type,
    });
  }

  return Response.json({ content, saved });
}

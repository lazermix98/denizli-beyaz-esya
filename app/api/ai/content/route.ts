import { requireUser } from "../../../lib/auth";
import { insertRow } from "../../../lib/supabase";

type AiRequest = {
  type?: string;
  topic?: string;
  tone?: string;
};

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const { type = "Instagram gönderisi", topic = "Dijital işletme yönetimi", tone = "güven veren" } =
    (await request.json()) as AiRequest;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenAI API anahtarı eksik. OPENAI_API_KEY environment değeri gerekli." }, { status: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
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
              "Türkçe, yerel işletmeler için güven veren, abartısız, satışa yardımcı ve uygulanabilir dijital pazarlama içerikleri üret.",
          },
          {
            role: "user",
            content: `İçerik türü: ${type}\nKonu: ${topic}\nTon: ${tone}\nFirma demosu: Denizli Beyaz Eşya Servisi\nTelefon: 0532 639 78 98`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json({ error: `OpenAI yanıtı alınamadı. Durum: ${response.status}` }, { status: response.status === 429 ? 429 : 502 });
    }

    const data = await response.json();
    const content =
      data.output_text ||
      data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content || [])
        .map((item: { text?: string }) => item.text)
        .filter(Boolean)
        .join("\n");

    if (!content) return Response.json({ error: "OpenAI boş içerik döndürdü." }, { status: 502 });

    const saved = await insertRow("ai_contents", {
      company_id: session.companyId,
      content_type: type,
      topic,
      output: content,
      channel: type,
    });

    return Response.json({ content, saved });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "AI isteği tamamlanamadı." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

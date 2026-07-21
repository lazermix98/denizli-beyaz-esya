import { requireUser } from "../../../lib/auth";
import { insertRow } from "../../../lib/supabase";

type AiRequest = {
  type?: string;
  topic?: string;
  tone?: string;
};

function isAiEnabled() {
  return process.env.AI_FEATURE_ENABLED === "true";
}

export async function POST(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  if (!isAiEnabled()) {
    return Response.json(
      { error: "AI service unavailable. AI content generation is temporarily disabled.", code: "AI_DISABLED" },
      { status: 503 }
    );
  }

  const {
    type = "Instagram gonderisi",
    topic = "Dijital isletme yonetimi",
    tone = "guven veren",
  } = (await request.json()) as AiRequest;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI service unavailable. OPENAI_API_KEY is not configured.", code: "AI_UNAVAILABLE" },
      { status: 503 }
    );
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
              "Turkce, yerel isletmeler icin guven veren, abartisiz, satisa yardimci ve uygulanabilir dijital pazarlama icerikleri uret.",
          },
          {
            role: "user",
            content: `Icerik turu: ${type}\nKonu: ${topic}\nTon: ${tone}\nFirma demosu: Denizli Beyaz Esya Servisi\nTelefon: 0532 639 78 98`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json(
        { error: "AI service unavailable. OpenAI request could not be completed.", code: "AI_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const data = await response.json();
    const content =
      data.output_text ||
      data.output
        ?.flatMap((item: { content?: { text?: string }[] }) => item.content || [])
        .map((item: { text?: string }) => item.text)
        .filter(Boolean)
        .join("\n");

    if (!content) {
      return Response.json(
        { error: "AI service unavailable. Empty AI response.", code: "AI_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const saved = await insertRow("ai_contents", {
      company_id: session.companyId,
      content_type: type,
      topic,
      output: content,
      channel: type,
    });

    return Response.json({ content, saved });
  } catch {
    return Response.json(
      { error: "AI service unavailable. AI request failed.", code: "AI_UNAVAILABLE" },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

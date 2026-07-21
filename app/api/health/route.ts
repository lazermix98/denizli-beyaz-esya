import { isPublicSupabaseConfigured, isSupabaseConfigured, selectRows } from "../../lib/supabase";

export async function GET() {
  let database = "not_configured";

  if (isSupabaseConfigured()) {
    try {
      await selectRows("companies?select=id&limit=1");
      database = "ok";
    } catch {
      database = "error";
    }
  }

  return Response.json({
    ok: database !== "error",
    app: "Isletme AI Otomasyon",
    database,
    publicSupabaseConfigured: isPublicSupabaseConfigured(),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    aiFeatureEnabled: process.env.AI_FEATURE_ENABLED === "true",
    time: new Date().toISOString(),
  });
}

import { getPublicSupabaseConfig, isDatabaseConfigured } from "../../lib/supabase";

export const runtime = "edge";

export async function GET() {
  const publicConfig = getPublicSupabaseConfig();

  return Response.json({
    ok: true,
    service: "Denizli Beyaz Eşya Servisi",
    databaseConfigured: isDatabaseConfigured(),
    publicSupabaseConfigured: Boolean(publicConfig.url && publicConfig.anonKey),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    time: new Date().toISOString(),
  });
}

import { isPublicSupabaseConfigured, isSupabaseConfigured } from "../../lib/supabase";

export async function GET() {
  return Response.json({
    ok: true,
    app: "İşletme AI Otomasyon",
    demoCompany: "Denizli Beyaz Eşya Servisi",
    databaseConfigured: isSupabaseConfigured(),
    publicSupabaseConfigured: isPublicSupabaseConfigured(),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    time: new Date().toISOString(),
  });
}

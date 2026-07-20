import { verifySession } from "../../../lib/auth";
import { isPublicSupabaseConfigured, isSupabaseConfigured } from "../../../lib/supabase";

export async function GET(request: Request) {
  const session = await verifySession(request);
  return Response.json({
    authenticated: Boolean(session),
    user: session ? { email: session.email, role: session.role, companyId: session.companyId } : null,
    databaseConfigured: isSupabaseConfigured(),
    publicSupabaseConfigured: isPublicSupabaseConfigured(),
  });
}

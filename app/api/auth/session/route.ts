import { verifySession } from "../../../lib/auth";
import { isPublicSupabaseConfigured, isSupabaseConfigured, selectRows } from "../../../lib/supabase";

export async function GET(request: Request) {
  const session = await verifySession(request);
  let sectorKey: string | null = null;
  if (session && isSupabaseConfigured()) {
    try {
      const rows = await selectRows<{ sector?: string }>(
        `companies?id=eq.${encodeURIComponent(session.companyId)}&select=sector&limit=1`
      );
      sectorKey = rows[0]?.sector || null;
    } catch {
      sectorKey = null;
    }
  }
  return Response.json({
    authenticated: Boolean(session),
    user: session ? { email: session.email, role: session.role, companyId: session.companyId, sectorKey } : null,
    databaseConfigured: isSupabaseConfigured(),
    publicSupabaseConfigured: isPublicSupabaseConfigured(),
  });
}

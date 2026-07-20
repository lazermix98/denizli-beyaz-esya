import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 20;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [requests, customers] = await Promise.all([
    selectRows(`requests?company_id=eq.${company}&select=id,customer_id,subject,description,status,source,created_at&order=created_at.desc&limit=25`),
    selectRows(`customers?company_id=eq.${company}&select=id,full_name&order=full_name.asc&limit=100`),
  ]);
  return Response.json({ requests, customers }, { headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" } });
}

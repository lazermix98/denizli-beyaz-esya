import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [customers, jobs] = await Promise.all([
    selectRows(`customers?company_id=eq.${company}&select=id,full_name,phone&order=created_at.desc&limit=25`),
    selectRows(`jobs?company_id=eq.${company}&select=id,customer_id,title,description,price,warranty_until&order=created_at.desc&limit=25`),
  ]);
  return Response.json({ customers, jobs }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

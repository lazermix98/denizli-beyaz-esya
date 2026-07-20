import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 20;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [appointments, customers, jobs] = await Promise.all([
    selectRows(`appointments?company_id=eq.${company}&select=id,customer_id,job_id,appointment_at,status,note&order=appointment_at.asc&limit=25`),
    selectRows(`customers?company_id=eq.${company}&select=id,full_name&order=full_name.asc&limit=100`),
    selectRows(`jobs?company_id=eq.${company}&select=id,title&order=created_at.desc&limit=100`),
  ]);
  return Response.json({ appointments, customers, jobs }, { headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" } });
}

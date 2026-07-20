import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";
import { pagedQuery } from "../_utils/pagination";

export const revalidate = 20;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const { pagePath, pagination } = await pagedQuery(
    `jobs?company_id=eq.${company}&select=id,customer_id,title,description,status,price,warranty_until&order=created_at.desc`,
    `jobs?company_id=eq.${company}&select=id`,
    request
  );
  const [jobs, customers] = await Promise.all([
    selectRows(pagePath),
    selectRows(`customers?company_id=eq.${company}&select=id,full_name&order=full_name.asc&limit=100`),
  ]);
  return Response.json({ jobs, customers, pagination }, { headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" } });
}

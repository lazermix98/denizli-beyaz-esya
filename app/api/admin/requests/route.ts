import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";
import { pagedQuery } from "../_utils/pagination";

export const revalidate = 20;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const { pagePath, pagination } = await pagedQuery(
    `requests?company_id=eq.${company}&select=id,customer_id,subject,description,status,source,created_at&order=created_at.desc`,
    `requests?company_id=eq.${company}&select=id`,
    request
  );
  const [requests, customers] = await Promise.all([
    selectRows(pagePath),
    selectRows(`customers?company_id=eq.${company}&select=id,full_name&order=full_name.asc&limit=100`),
  ]);
  return Response.json({ requests, customers, pagination }, { headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" } });
}

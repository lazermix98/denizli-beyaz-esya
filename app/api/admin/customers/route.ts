import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";
import { pagedQuery } from "../_utils/pagination";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const { pagePath, pagination } = await pagedQuery(
    `customers?company_id=eq.${company}&select=id,full_name,phone,district,neighborhood,created_at&order=created_at.desc`,
    `customers?company_id=eq.${company}&select=id`,
    request
  );
  const customers = await selectRows(pagePath);
  return Response.json({ customers, pagination }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

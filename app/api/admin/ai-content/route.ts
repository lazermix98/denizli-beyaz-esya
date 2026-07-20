import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";
import { pagedQuery } from "../_utils/pagination";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const { pagePath, pagination } = await pagedQuery(
    `ai_contents?company_id=eq.${company}&select=id,content_type,topic,output,created_at&order=created_at.desc`,
    `ai_contents?company_id=eq.${company}&select=id`,
    request
  );
  const content = await selectRows(pagePath);
  return Response.json({ content, pagination }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const templates = await selectRows(
    `message_templates?company_id=eq.${company}&select=id,channel,title,body,created_at&order=created_at.desc&limit=25`
  );
  return Response.json({ templates }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

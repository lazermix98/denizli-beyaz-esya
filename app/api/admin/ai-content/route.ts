import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const content = await selectRows(
    `ai_contents?company_id=eq.${company}&select=id,content_type,topic,output,created_at&order=created_at.desc&limit=25`
  );
  return Response.json({ content }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

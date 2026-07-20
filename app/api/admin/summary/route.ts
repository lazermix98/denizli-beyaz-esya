import { requireUser } from "../../../lib/auth";
import { selectRows, supabaseCount } from "../../../lib/supabase";

type JobMetric = { status: string; price: number };

export const revalidate = 15;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [customerCount, requestCount, appointmentCount, jobs, recentRequests, recentContent] = await Promise.all([
    supabaseCount(`customers?company_id=eq.${company}&select=id`),
    supabaseCount(`requests?company_id=eq.${company}&status=neq.done&select=id`),
    supabaseCount(`appointments?company_id=eq.${company}&select=id`),
    selectRows<JobMetric>(`jobs?company_id=eq.${company}&select=status,price`),
    selectRows(`requests?company_id=eq.${company}&select=id,subject,status,created_at&order=created_at.desc&limit=5`),
    selectRows(`ai_contents?company_id=eq.${company}&select=id,content_type,topic,created_at&order=created_at.desc&limit=5`),
  ]);

  const openJobs = jobs.filter((item) => item.status !== "done").length;
  const revenue = jobs.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return Response.json(
    {
      summary: { customerCount, openRequests: requestCount, appointmentCount, openJobs, revenue },
      recentRequests,
      recentContent,
    },
    { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
  );
}

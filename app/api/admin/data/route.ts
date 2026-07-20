import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [customers, requests, devices, jobs, appointments, content, templates] = await Promise.all([
    selectRows(`customers?company_id=eq.${company}&select=*&order=created_at.desc`),
    selectRows(`requests?company_id=eq.${company}&select=*&order=created_at.desc`),
    selectRows(`devices?company_id=eq.${company}&select=*&order=created_at.desc`),
    selectRows(`jobs?company_id=eq.${company}&select=*&order=created_at.desc`),
    selectRows(`appointments?company_id=eq.${company}&select=*&order=appointment_at.asc`),
    selectRows(`ai_contents?company_id=eq.${company}&select=*&order=created_at.desc`),
    selectRows(`message_templates?company_id=eq.${company}&select=*&order=created_at.desc`),
  ]);

  return Response.json({ customers, requests, devices, jobs, appointments, content, templates });
}

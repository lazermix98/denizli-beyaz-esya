import { requireUser } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const revalidate = 30;

export async function GET(request: Request) {
  const session = await requireUser(request);
  if (session instanceof Response) return session;

  const company = encodeURIComponent(session.companyId);
  const [devices, customers] = await Promise.all([
    selectRows(`devices?company_id=eq.${company}&select=id,customer_id,device_type,brand,model&order=created_at.desc&limit=25`),
    selectRows(`customers?company_id=eq.${company}&select=id,full_name&order=full_name.asc&limit=100`),
  ]);
  return Response.json({ devices, customers }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
}

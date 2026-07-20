import { requireAdmin } from "../../../lib/auth";
import { selectRows } from "../../../lib/supabase";

export const runtime = "edge";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const [customers, devices, services, appointments, parts, payments, aiContent] =
    await Promise.all([
      selectRows("customers?select=*&order=created_at.desc"),
      selectRows("devices?select=*&order=created_at.desc"),
      selectRows("service_records?select=*&order=created_at.desc"),
      selectRows("appointments?select=*&order=appointment_at.asc"),
      selectRows("used_parts?select=*&order=created_at.desc"),
      selectRows("payments?select=*&order=created_at.desc"),
      selectRows("ai_content_items?select=*&order=created_at.desc"),
    ]);

  return Response.json({ customers, devices, services, appointments, parts, payments, aiContent });
}

import { verifySession } from "../../../lib/auth";
import { isDatabaseConfigured } from "../../../lib/supabase";

export const runtime = "edge";

export async function GET(request: Request) {
  const session = await verifySession(request);
  return Response.json({
    authenticated: Boolean(session),
    user: session ? { email: session.email, role: session.role } : null,
    databaseConfigured: isDatabaseConfigured(),
    demoMode: process.env.ALLOW_DEMO_MODE === "true",
  });
}

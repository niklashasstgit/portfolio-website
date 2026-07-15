import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { clearEvents } from "@/lib/analytics-store";

/**
 * Admin-gated: permanently delete all recorded analytics events. Recording
 * continues afterward — this only wipes the history, giving a clean slate.
 */
export async function POST() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await clearEvents();
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "clear failed" }, { status: 500 });
  }
}

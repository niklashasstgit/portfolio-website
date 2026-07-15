import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { writeSettings } from "@/lib/site-settings-store";
import type { ProjectOverride } from "@/lib/site-settings";

/**
 * Admin-gated settings write (cookie session, not the dev-console password).
 * Currently used by the project manager to publish projectOverrides. Reuses the
 * existing writeSettings() so validation + cache revalidation are shared with the
 * dev console — a save is live for every visitor immediately.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { projectOverrides?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const patch = {
    projectOverrides: (body.projectOverrides ?? {}) as Record<string, ProjectOverride>,
  };

  try {
    const saved = await writeSettings(patch);
    return Response.json(
      { ok: true, projectOverrides: saved.projectOverrides },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "save failed" }, { status: 500 });
  }
}

import { verifyDevPassword } from "@/lib/dev-auth";
import { readSettings, writeSettings } from "@/lib/site-settings-store";
import type { SiteSettings } from "@/lib/site-settings";

/**
 * Public GET → current published settings (used by the dev panel to re-sync / discard).
 * Authenticated POST → validate the passphrase, persist the patch, return the merged doc.
 *
 * Route handlers are uncached by default in this Next version, so no extra config needed.
 */

export async function GET() {
  const settings = await readSettings();
  return Response.json(settings, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: { password?: unknown; patch?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const ok = await verifyDevPassword(password, process.env.DEV_ADMIN_PASSWORD);
  if (!ok) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const patch = (body.patch && typeof body.patch === "object" ? body.patch : {}) as Partial<SiteSettings>;
  try {
    const saved = await writeSettings(patch);
    return Response.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "save failed" }, { status: 500 });
  }
}

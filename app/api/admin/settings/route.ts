import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { writeSettings } from "@/lib/site-settings-store";
import type { IpLabel, ProjectOverride, SiteSettings } from "@/lib/site-settings";

/**
 * Admin-gated settings write (cookie session, not the dev-console password).
 * Used by the project manager (projectOverrides) and the analytics dashboard's
 * IP manager (ipLabels). Reuses the existing writeSettings() so validation +
 * cache revalidation are shared with the dev console — a save is live for every
 * visitor immediately. Only the keys present in the body are updated.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    projectOverrides?: unknown;
    ipLabels?: unknown;
    deviceLabels?: unknown;
    excludedPrefixes?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  // Only include keys the caller actually sent, so a partial save doesn't wipe
  // the other maps (mergeSettings replaces a map wholesale when it's present).
  const patch: Partial<SiteSettings> = {};
  if ("projectOverrides" in body) {
    patch.projectOverrides = (body.projectOverrides ?? {}) as Record<string, ProjectOverride>;
  }
  if ("ipLabels" in body) {
    patch.ipLabels = (body.ipLabels ?? {}) as Record<string, IpLabel>;
  }
  if ("deviceLabels" in body) {
    patch.deviceLabels = (body.deviceLabels ?? {}) as Record<string, IpLabel>;
  }
  if ("excludedPrefixes" in body) {
    patch.excludedPrefixes = (body.excludedPrefixes ?? []) as string[];
  }

  try {
    const saved = await writeSettings(patch);
    return Response.json(
      {
        ok: true,
        projectOverrides: saved.projectOverrides,
        ipLabels: saved.ipLabels,
        deviceLabels: saved.deviceLabels,
        excludedPrefixes: saved.excludedPrefixes,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "save failed" }, { status: 500 });
  }
}

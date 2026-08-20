// NOTE: server-only module.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { isLocalRuntime } from "./settings";

/**
 * Every tools endpoint passes through here.
 *
 * Two gates, both required:
 *  - the same signed session cookie the /admin console uses, so /tools shares
 *    one password with it;
 *  - a local runtime, because the tool drives a real browser and reads a real
 *    disk. On a serverless host neither exists, and the archive must not be
 *    served from there anyway.
 *
 * Returns a Response to send back, or null when the caller may proceed.
 */
export async function guardToolsRequest(): Promise<Response | null> {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!isLocalRuntime()) {
    return Response.json(
      {
        error:
          "This tool only runs on your own machine — it needs a real browser and local disk access.",
        code: "not-local",
      },
      { status: 503 }
    );
  }
  return null;
}

/** Wrap a handler so both gates are always applied. */
export function guarded(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const denied = await guardToolsRequest();
    if (denied) return denied;
    try {
      return await handler(request);
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  };
}

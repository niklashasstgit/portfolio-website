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
export async function guardToolsRequest(
  opts: { requireLocal?: boolean } = {}
): Promise<Response | null> {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  // Reading is allowed anywhere the archive can be reached — on the deployed
  // site that means the OneDrive app folder. Only the parts that drive a
  // browser or write to disk truly require a local runtime.
  if (opts.requireLocal !== false && !isLocalRuntime()) {
    return Response.json(
      {
        error:
          "Backups run on your own machine — they need a real browser and local disk access.",
        code: "not-local",
      },
      { status: 503 }
    );
  }
  return null;
}

/** Wrap a handler that needs the browser/disk (backups, session, settings). */
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

/** Wrap a read-only handler: signed in, but happy to serve from OneDrive. */
export function guardedRead(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const denied = await guardToolsRequest({ requireLocal: false });
    if (denied) return denied;
    try {
      return await handler(request);
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 500 });
    }
  };
}

import { cookies } from "next/headers";
import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { exchangeCode, writeToken } from "@/lib/tools/whatsapp/onedrive/auth";
import { accountName } from "@/lib/tools/whatsapp/onedrive/drive";
import { STATE_COOKIE } from "../link/route";

export const dynamic = "force-dynamic";

/** Microsoft redirects here after consent. */
export async function GET(request: Request) {
  const denied = await guardToolsRequest({ requireLocal: false });
  if (denied) return denied;

  const url = new URL(request.url);
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });

  const back = (message: string) =>
    Response.redirect(`${url.origin}/tools/whatsapp?onedrive=${encodeURIComponent(message)}`, 302);

  if (error) return back(`failed: ${error}`);
  if (!code) return back("failed: no code returned");
  if (!state || !expected || state !== expected) return back("failed: state mismatch");

  try {
    const token = await exchangeCode(code, `${url.origin}/api/tools/whatsapp/onedrive/callback`);
    const account = await accountName().catch(() => "");
    if (account) await writeToken({ ...token, account });
    return back("linked");
  } catch (err) {
    return back(`failed: ${(err as Error).message}`);
  }
}

import { guardedRead } from "@/lib/tools/whatsapp/guard";
import { isOneDriveConfigured, readToken } from "@/lib/tools/whatsapp/onedrive/auth";
import { accountName } from "@/lib/tools/whatsapp/onedrive/drive";
import { resolveSource } from "@/lib/tools/whatsapp/source";

export const dynamic = "force-dynamic";

export const GET = guardedRead(async () => {
  const configured = isOneDriveConfigured();
  const token = configured ? await readToken() : null;
  let account = token?.account ?? "";
  if (token && !account) {
    account = await accountName().catch(() => "");
  }
  return Response.json({
    configured,
    linked: !!token,
    account,
    linkedAt: token?.linkedAt ?? null,
    source: await resolveSource(),
  });
});

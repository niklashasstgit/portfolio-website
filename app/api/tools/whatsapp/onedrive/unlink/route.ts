import { guardedRead } from "@/lib/tools/whatsapp/guard";
import { clearToken } from "@/lib/tools/whatsapp/onedrive/auth";

export const dynamic = "force-dynamic";

/** Forget the stored tokens. Files already in OneDrive are left alone. */
export const POST = guardedRead(async () => {
  await clearToken();
  return Response.json({ linked: false });
});

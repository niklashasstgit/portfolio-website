import { guardedRead } from "@/lib/tools/whatsapp/guard";
import { loadIndex } from "@/lib/tools/whatsapp/source";

export const dynamic = "force-dynamic";

/** The archived chat list, from local disk or the OneDrive app folder. */
export const GET = guardedRead(async () => {
  const { index, source } = await loadIndex();
  return Response.json({
    chats: index.chats,
    totals: index.totals,
    updatedAt: index.updatedAt,
    source,
  });
});

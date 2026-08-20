import { guarded } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { ensureArchive, readIndex } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/** The archived chat list (from the index, so this never reads every archive). */
export const GET = guarded(async () => {
  const settings = await readToolSettings();
  await ensureArchive(settings.archiveRoot);
  const index = await readIndex(settings.archiveRoot);
  return Response.json({ chats: index.chats, totals: index.totals, updatedAt: index.updatedAt });
});

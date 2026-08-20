import { guarded } from "@/lib/tools/whatsapp/guard";
import { readToolSettings, writeToolSettings } from "@/lib/tools/whatsapp/settings";
import { ensureArchive, readIndex } from "@/lib/tools/whatsapp/vault";
import type { WhatsAppToolSettings } from "@/lib/tools/whatsapp/settings";

export const dynamic = "force-dynamic";

export const GET = guarded(async () => Response.json(await readToolSettings()));

/** PUT a partial settings patch; the store validates and clamps every field. */
export const PUT = guarded(async (request: Request) => {
  const patch = (await request.json().catch(() => ({}))) as Partial<WhatsAppToolSettings>;
  const saved = await writeToolSettings(patch);

  // Surface immediately whether the (possibly new) archive root is usable,
  // rather than letting the next backup be the thing that discovers it isn't.
  let archiveOk = true;
  let archiveError: string | null = null;
  try {
    await ensureArchive(saved.archiveRoot);
    await readIndex(saved.archiveRoot);
  } catch (err) {
    archiveOk = false;
    archiveError = (err as Error).message;
  }

  return Response.json({ settings: saved, archiveOk, archiveError });
});

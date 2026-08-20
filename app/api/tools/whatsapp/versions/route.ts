import { guarded } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { listVersions } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/** Every backup run ever made, newest first. */
export const GET = guarded(async () => {
  const settings = await readToolSettings();
  return Response.json({ versions: await listVersions(settings.archiveRoot) });
});

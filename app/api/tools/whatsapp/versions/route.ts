import { guardedRead } from "@/lib/tools/whatsapp/guard";
import { loadIndex } from "@/lib/tools/whatsapp/source";

export const dynamic = "force-dynamic";

/** Every backup run ever made, newest first. */
export const GET = guardedRead(async () => {
  const { index } = await loadIndex();
  return Response.json({ versions: index.versions });
});

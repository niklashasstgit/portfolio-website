import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { readVersion } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/** One backup run's manifest: which chats it touched and what it added. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { id } = await ctx.params;
  const settings = await readToolSettings();
  const version = await readVersion(settings.archiveRoot, id);
  if (!version) return Response.json({ error: "unknown version" }, { status: 404 });
  return Response.json(version);
}

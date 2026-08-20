import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { messagesAsOf, readChat } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/**
 * One chat's transcript.
 *
 * `?version=<id>` rewinds it: the vault is filtered to messages first archived
 * at or before that backup, reconstructing exactly what the archive held then.
 */
export async function GET(request: Request, ctx: { params: Promise<{ folder: string }> }) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { folder } = await ctx.params;
  const settings = await readToolSettings();
  const archive = await readChat(settings.archiveRoot, decodeURIComponent(folder));
  if (!archive) return Response.json({ error: "chat not archived" }, { status: 404 });

  const version = new URL(request.url).searchParams.get("version");
  if (version) {
    const messages = messagesAsOf(archive.messages, version);
    return Response.json({ ...archive, messages, viewingVersion: version });
  }
  return Response.json(archive);
}

import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { loadChat } from "@/lib/tools/whatsapp/source";
import { messagesAsOf } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/**
 * One chat's transcript.
 *
 * `?version=<id>` rewinds it: the vault is filtered to messages first archived
 * at or before that backup, reconstructing exactly what the archive held then.
 */
export async function GET(request: Request, ctx: { params: Promise<{ folder: string }> }) {
  const denied = await guardToolsRequest({ requireLocal: false });
  if (denied) return denied;

  const { folder } = await ctx.params;
  const archive = await loadChat(decodeURIComponent(folder));
  if (!archive) return Response.json({ error: "chat not archived" }, { status: 404 });

  const version = new URL(request.url).searchParams.get("version");
  if (version) {
    return Response.json({
      ...archive,
      messages: messagesAsOf(archive.messages, version),
      viewingVersion: version,
    });
  }
  return Response.json(archive);
}

import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { loadVersion } from "@/lib/tools/whatsapp/source";

export const dynamic = "force-dynamic";

/** One backup run's manifest: which chats it touched and what it added. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guardToolsRequest({ requireLocal: false });
  if (denied) return denied;

  const { id } = await ctx.params;
  const version = await loadVersion(id);
  if (!version) return Response.json({ error: "unknown version" }, { status: 404 });
  return Response.json(version);
}

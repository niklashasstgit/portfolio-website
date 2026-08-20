import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { cancelJob, getJob, publicJob } from "@/lib/tools/whatsapp/runtime";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return Response.json({ error: "unknown job" }, { status: 404 });
  return Response.json(publicJob(job));
}

/** DELETE asks a running backup to stop after the chat it is on. */
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { id } = await ctx.params;
  return Response.json({ cancelled: cancelJob(id) });
}

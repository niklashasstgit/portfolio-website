import { guardToolsRequest } from "@/lib/tools/whatsapp/guard";
import { getJob, type JobEvent } from "@/lib/tools/whatsapp/runtime";

export const dynamic = "force-dynamic";

/**
 * Server-sent events for one job.
 *
 * The backlog is replayed before live events are attached, so opening the
 * page mid-backup still shows the whole story rather than starting blank.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await guardToolsRequest();
  if (denied) return denied;

  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return Response.json({ error: "unknown job" }, { status: 404 });

  const encoder = new TextEncoder();
  let listener: ((ev: JobEvent) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (ev: JobEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        } catch {
          /* client already gone */
        }
      };

      for (const ev of job.events) send(ev);

      if (job.state === "done" || job.state === "failed" || job.state === "cancelled") {
        controller.close();
        return;
      }

      listener = (ev: JobEvent) => {
        send(ev);
        if (ev.phase === "done" || ev.phase === "failed" || ev.phase === "cancelled") {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      };
      job.listeners.add(listener);
    },
    cancel() {
      if (listener) job.listeners.delete(listener);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

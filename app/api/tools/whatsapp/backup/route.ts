import { guarded } from "@/lib/tools/whatsapp/guard";
import { createJob, runQueued, publicJob } from "@/lib/tools/whatsapp/runtime";
import { runBackup } from "@/lib/tools/whatsapp/backup";
import type { VersionMode } from "@/lib/tools/whatsapp/types";

export const dynamic = "force-dynamic";

/**
 * POST { mode: "full" | "partial", label?, chats?, media? }
 * Starts a backup run and returns the job immediately — progress is streamed
 * from /jobs/[id]/stream, because a full sweep can take many minutes.
 */
export const POST = guarded(async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    label?: string;
    chats?: string[];
    media?: boolean;
    limitPerChat?: number;
  };

  const mode: VersionMode = body.mode === "full" ? "full" : "partial";
  const label =
    typeof body.label === "string" && body.label.trim() ? body.label.trim().slice(0, 80) : undefined;

  const job = createJob("backup", label ?? (mode === "full" ? "Full backup" : "Update"));
  runQueued(job, (j) =>
    runBackup(j, {
      mode,
      label,
      chats: Array.isArray(body.chats) ? body.chats.filter((c) => typeof c === "string") : undefined,
      media: typeof body.media === "boolean" ? body.media : undefined,
      limitPerChat: typeof body.limitPerChat === "number" ? body.limitPerChat : undefined,
    })
  );

  return Response.json(publicJob(job), { status: 202 });
});

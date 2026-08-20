import { guarded } from "@/lib/tools/whatsapp/guard";
import { createJob, emit, publicJob, runQueued } from "@/lib/tools/whatsapp/runtime";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { syncArchiveUp } from "@/lib/tools/whatsapp/onedrive/sync";
import { readToken } from "@/lib/tools/whatsapp/onedrive/auth";

export const dynamic = "force-dynamic";

/** Mirror the local archive into the OneDrive app folder. */
export const POST = guarded(async (request: Request) => {
  if (!(await readToken())) {
    return Response.json({ error: "OneDrive is not linked yet." }, { status: 400 });
  }
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };

  const job = createJob("sync", "Sync to OneDrive");
  runQueued(job, async (j) => {
    const settings = await readToolSettings();
    emit(j, { phase: "sync-start", root: settings.archiveRoot });
    const result = await syncArchiveUp(settings.archiveRoot, {
      force: !!body.force,
      signal: j.cancel,
      onProgress: (p) =>
        emit(j, {
          phase: "sync-progress",
          uploaded: p.uploaded,
          skipped: p.skipped,
          total: p.total,
          current: p.current,
          bytes: p.bytes,
        }),
    });
    emit(j, { phase: "sync-done", ...result });
    return result;
  });

  return Response.json(publicJob(job), { status: 202 });
});

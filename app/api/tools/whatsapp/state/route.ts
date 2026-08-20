import { guarded } from "@/lib/tools/whatsapp/guard";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { peekSession, listJobs, publicJob } from "@/lib/tools/whatsapp/runtime";
import { ensureArchive, readIndex } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/** Everything the tool's shell needs on load: settings, archive index, session. */
export const GET = guarded(async () => {
  const settings = await readToolSettings();
  await ensureArchive(settings.archiveRoot);
  const index = await readIndex(settings.archiveRoot);
  const session = peekSession();

  return Response.json({
    settings,
    index,
    session: session ? await session.status() : { running: false, loggedIn: false },
    jobs: listJobs()
      .filter((j) => j.state === "running" || j.state === "queued")
      .map((j) => publicJob(j, 20)),
  });
});

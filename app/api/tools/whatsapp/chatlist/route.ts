import { guarded } from "@/lib/tools/whatsapp/guard";
import { createJob, emit, getSession, publicJob, runQueued } from "@/lib/tools/whatsapp/runtime";
import { listChats } from "@/lib/tools/whatsapp/extractor";
import { readToolSettings } from "@/lib/tools/whatsapp/settings";
import { ensureArchive, readIndex } from "@/lib/tools/whatsapp/vault";

export const dynamic = "force-dynamic";

/**
 * Discover the chat list without backing anything up.
 *
 * This is what makes batching possible: read the list once (seconds), then let
 * the user decide how much to take in each run. Every chat is annotated with
 * what the archive already holds, including its measured size — WhatsApp itself
 * offers no size hint, so a chat's cost is only known once it has been read.
 */
export const POST = guarded(async () => {
  const job = createJob("chats", "Scan chat list");

  runQueued(job, async (j) => {
    const session = await getSession();
    const status = await session.status();
    if (!status.loggedIn) {
      emit(j, { phase: "login-needed", message: "Scan the QR code in the browser window" });
      await session.waitForLogin(300_000, (state) => emit(j, { phase: "login", state }));
    }

    const live = await listChats(session, {
      onProgress: (found) => emit(j, { phase: "chats", found }),
    });

    const settings = await readToolSettings();
    await ensureArchive(settings.archiveRoot);
    const index = await readIndex(settings.archiveRoot);
    const byTitle = new Map(index.chats.map((c) => [c.title, c]));
    const excluded = new Set(settings.excluded);

    const chats = live.map((c) => {
      const known = byTitle.get(c.name);
      return {
        name: c.name,
        isGroup: c.isGroup,
        preview: c.preview,
        unread: c.unread,
        excluded: excluded.has(c.name),
        archived: known
          ? {
              folder: known.folder,
              messages: known.messages,
              bytes: known.bytes ?? 0,
              lastDate: known.lastDate,
              lastBackupVersion: known.lastBackupVersion ?? "",
            }
          : null,
      };
    });

    // Chats already archived elsewhere that WhatsApp no longer lists — kept so
    // the planner can show they exist without offering to re-read them.
    const liveNames = new Set(live.map((c) => c.name));
    const vanished = index.chats
      .filter((c) => !liveNames.has(c.title))
      .map((c) => ({ name: c.title, messages: c.messages, bytes: c.bytes ?? 0 }));

    return { chats, vanished, scannedAt: new Date().toISOString() };
  });

  return Response.json(publicJob(job), { status: 202 });
});

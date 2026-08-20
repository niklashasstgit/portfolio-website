// NOTE: server-only module.
import path from "path";
import { readToolSettings } from "./settings";
import { emit, getSession, type Job } from "./runtime";
import { listChats, resetToChatList, sweepChat } from "./extractor";
import { normalize } from "./normalize";
import { writeExports } from "./exports";
import { versionId as makeVersionId } from "./dates";
import * as vault from "./vault";
import type { ArchiveVersion, VersionChatEntry, VersionMode } from "./types";

export interface BackupParams {
  mode: VersionMode;
  label?: string;
  /** Restrict the run to these chat titles; empty means every chat. */
  chats?: string[];
  limitPerChat?: number;
  media?: boolean;
}

/**
 * One backup run.
 *
 *   full     every chat, swept to the very beginning of its history
 *   partial  every chat, swept only back to what the vault already holds
 *
 * Both write into the same append-only vault; the difference is only how far
 * back each sweep walks. A run never deletes anything, so a partial update
 * cannot lose messages a full backup captured, and a chat deleted from your
 * phone between runs simply stops being re-seen — it stays in the archive.
 */
export async function runBackup(job: Job, params: BackupParams): Promise<ArchiveVersion> {
  const settings = await readToolSettings();
  const root = settings.archiveRoot;
  await vault.ensureArchive(root);

  emit(job, { phase: "archive", root, mode: params.mode });

  const session = await getSession();
  const status = await session.status();
  if (!status.loggedIn) {
    emit(job, { phase: "login-needed", message: "Scan the QR code in the browser window" });
    await session.waitForLogin(300_000, (state) => emit(job, { phase: "login", state }));
  }
  emit(job, { phase: "linked" });

  const discovered = await listChats(session, {
    onProgress: (found) => emit(job, { phase: "chats", found }),
  });

  const excluded = new Set(settings.excluded);
  const wanted = params.chats?.length ? new Set(params.chats) : null;
  const targets = discovered.filter(
    (c) => !excluded.has(c.name) && (!wanted || wanted.has(c.name))
  );

  emit(job, { phase: "plan", total: targets.length, discovered: discovered.length });

  const version = vault.newVersion(makeVersionId(), params.mode, params.label);
  version.note =
    params.mode === "full"
      ? "Complete sweep of every chat's history."
      : "Only messages newer than the previous backup.";
  await vault.writeVersion(root, version);
  emit(job, { phase: "version", id: version.id, label: version.label });

  const wantMedia = params.media ?? settings.media;
  const limit = params.limitPerChat ?? settings.messageLimit;

  for (let i = 0; i < targets.length; i++) {
    if (job.cancel.cancelled) break;
    const chat = targets[i];

    emit(job, { phase: "chat-start", title: chat.name, index: i + 1, total: targets.length });

    // Leave the side panel on the plain, unfiltered chat list before every
    // chat. Without this, one chat that navigates elsewhere makes every later
    // chat report "not found in the chat list".
    await resetToChatList(session).catch(() => {});

    const entry: VersionChatEntry = {
      title: chat.name,
      folder: "",
      swept: 0,
      added: 0,
      updated: 0,
      total: 0,
      firstDate: null,
      lastDate: null,
      reachedStart: false,
    };

    try {
      const folder = await vault.resolveFolder(root, chat.name);
      entry.folder = folder;

      const existing = await vault.readChat(root, folder);
      const knownIds =
        params.mode === "partial" && existing
          ? new Set(existing.messages.map((m) => m.id))
          : undefined;

      const sweep = await sweepChat(session, {
        name: chat.name,
        limit,
        knownIds,
        stopAfterKnown: knownIds ? settings.partialStopAfterKnown : 0,
        signal: job.cancel,
        saveMedia: wantMedia
          ? (messageId, dataUrl) => vault.saveMedia(root, folder, messageId, dataUrl)
          : undefined,
        onProgress: (p) =>
          emit(job, {
            phase: "chat-progress",
            title: chat.name,
            index: i + 1,
            total: targets.length,
            collected: p.collected,
            atTop: p.atTop,
          }),
      });

      entry.swept = sweep.messages.length;
      entry.reachedStart = sweep.reachedTop;

      const norm = normalize(sweep.messages, {
        chatTitle: chat.name,
        selfName: "You",
        dateOrder: settings.dateOrder,
      });

      const archive =
        existing ??
        vault.newChatArchive(
          chat.name,
          folder,
          version.id,
          !!sweep.chat?.isGroup,
          norm.dateOrder,
          "You"
        );

      const merged = vault.mergeIntoArchive(archive.messages, norm.messages, version.id);
      archive.messages = merged.messages;
      archive.updatedAt = new Date().toISOString();
      archive.lastSeen = version.id;
      archive.presentInLatest = true;
      archive.dateOrder = norm.dateOrder;
      if (sweep.chat?.isGroup) archive.isGroup = true;
      vault.recomputeStats(archive);

      await vault.writeChat(root, archive);
      if (settings.exports) {
        await writeExports(path.join(vault.chatsPath(root), folder), archive);
      }
      // measured after the exports exist, so the figure reflects the real cost
      await vault.upsertIndexEntry(root, archive, await vault.folderBytes(root, folder));

      entry.added = merged.added;
      entry.updated = merged.updated;
      entry.total = archive.stats.messages;
      entry.firstDate = archive.stats.firstDate;
      entry.lastDate = archive.stats.lastDate;

      emit(job, {
        phase: "chat-done",
        title: chat.name,
        index: i + 1,
        total: targets.length,
        added: merged.added,
        messages: archive.stats.messages,
      });
    } catch (err) {
      // One awkward chat must not abandon the whole backup.
      entry.error = (err as Error).message;
      emit(job, { phase: "chat-failed", title: chat.name, error: entry.error });
    }

    version.chats.push(entry);
    version.totals = {
      chats: version.chats.length,
      added: version.chats.reduce((n, c) => n + c.added, 0),
      updated: version.chats.reduce((n, c) => n + c.updated, 0),
      messages: version.chats.reduce((n, c) => n + c.total, 0),
    };
    await vault.writeVersion(root, version);
  }

  // Chats that WhatsApp no longer offers keep everything they had.
  if (!job.cancel.cancelled && !wanted) {
    const { vanished } = await vault.markPresence(
      root,
      discovered.map((c) => c.name),
      version.id
    );
    if (vanished.length) emit(job, { phase: "vanished", chats: vanished });
  }

  version.status = job.cancel.cancelled ? "cancelled" : "complete";
  version.finishedAt = new Date().toISOString();
  await vault.writeVersion(root, version);

  // Mirror to OneDrive if it is linked, so the deployed site can read what was
  // just captured. Kept out of the sweep loop on purpose: a network hiccup
  // should never cost a backup that already succeeded.
  try {
    const { readToken } = await import("./onedrive/auth");
    if (await readToken()) {
      emit(job, { phase: "sync-start", root });
      const { syncArchiveUp } = await import("./onedrive/sync");
      const result = await syncArchiveUp(root, {
        signal: job.cancel,
        onProgress: (p) =>
          emit(job, { phase: "sync-progress", uploaded: p.uploaded, total: p.total, current: p.current }),
      });
      emit(job, { phase: "sync-done", uploaded: result.uploaded, skipped: result.skipped, failed: result.failed.length });
    }
  } catch (err) {
    emit(job, { phase: "sync-failed", error: (err as Error).message });
  }

  emit(job, { phase: "finished", version: version.id, totals: version.totals });
  return version;
}

// NOTE: server-only module (node:fs).
import { promises as fs } from "fs";
import path from "path";
import { folderName, idStem } from "./slug";
import { summarize } from "./normalize";
import type {
  ArchiveIndex,
  ArchiveVersion,
  ArchivedMessage,
  ChatArchive,
  ChatIndexEntry,
  VersionMode,
} from "./types";
import { EMPTY_INDEX } from "./types";

/**
 * The archive is an **append-only vault**.
 *
 * Every message ever seen is kept forever, tagged with the version that first
 * archived it. Nothing a later sweep does can remove anything: if a chat is
 * deleted in WhatsApp, or a message is deleted for everyone, it simply stops
 * being re-seen — the archive still has it. That is the whole point of a
 * backup you keep because you do not trust the source.
 *
 * A "version" is therefore a *record of a backup run*, not a second copy of
 * the data:
 *
 *   full     sweep every chat's whole history
 *   partial  sweep only until each chat's newest already-archived message
 *
 * Viewing "as of" a version filters the vault to messages whose `firstSeen`
 * is at or before it, which reconstructs exactly what the archive held then —
 * without ever storing the same message twice.
 *
 *   <archiveRoot>/
 *     archive.json              index: chat + version summaries
 *     chats/<folder>/chat.json  the full, append-only transcript
 *     chats/<folder>/media/
 *     versions/<id>.json        one manifest per backup run
 */

export const CHATS_DIR = "chats";
export const VERSIONS_DIR = "versions";
export const MEDIA_DIR = "media";
const INDEX_FILE = "archive.json";

export function chatsPath(root: string): string {
  return path.join(root, CHATS_DIR);
}
export function chatDir(root: string, folder: string): string {
  const dir = path.join(chatsPath(root), folder);
  const rel = path.relative(chatsPath(root), dir);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("refusing to touch a path outside the archive");
  }
  return dir;
}
export function versionsPath(root: string): string {
  return path.join(root, VERSIONS_DIR);
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  // Write-then-rename so a crash mid-write cannot truncate an existing archive.
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function ensureArchive(root: string): Promise<void> {
  await fs.mkdir(chatsPath(root), { recursive: true });
  await fs.mkdir(versionsPath(root), { recursive: true });
}

export async function readIndex(root: string): Promise<ArchiveIndex> {
  return readJson<ArchiveIndex>(path.join(root, INDEX_FILE), { ...EMPTY_INDEX });
}

export async function writeIndex(root: string, index: ArchiveIndex): Promise<void> {
  index.updatedAt = new Date().toISOString();
  index.totals = {
    chats: index.chats.length,
    messages: index.chats.reduce((sum, c) => sum + c.messages, 0),
  };
  await writeJson(path.join(root, INDEX_FILE), index);
}

export async function readChat(root: string, folder: string): Promise<ChatArchive | null> {
  return readJson<ChatArchive | null>(path.join(chatDir(root, folder), "chat.json"), null);
}

export async function writeChat(root: string, archive: ChatArchive): Promise<void> {
  await writeJson(path.join(chatDir(root, archive.folder), "chat.json"), archive);
}

/** Ids already archived, for deciding when a partial sweep can stop. */
export async function knownMessageIds(root: string, folder: string): Promise<Set<string>> {
  const archive = await readChat(root, folder);
  return new Set((archive?.messages ?? []).map((m) => m.id));
}

/** Resolve the folder for a chat title, reusing the one that already owns it. */
export async function resolveFolder(root: string, title: string): Promise<string> {
  const index = await readIndex(root);
  const existing = index.chats.find((c) => c.title === title);
  if (existing) return existing.folder;

  const base = folderName(title);
  const taken = new Set(index.chats.map((c) => c.folder));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n++) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`no free folder name for "${title}"`);
}

/** Store one captured thumbnail; returns the chat-relative path. */
export async function saveMedia(
  root: string,
  folder: string,
  messageId: string,
  dataUrl: string
): Promise<string | null> {
  // [\s\S] rather than the `s` flag: this project targets ES2017.
  const m = /^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([\s\S]*)$/.exec(dataUrl || "");
  if (!m) return null;
  const ext =
    (
      {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "audio/ogg": "ogg",
        "audio/mpeg": "mp3",
        "application/pdf": "pdf",
      } as Record<string, string>
    )[m[1]] ?? "bin";

  const dir = path.join(chatDir(root, folder), MEDIA_DIR);
  await fs.mkdir(dir, { recursive: true });
  const file = `${idStem(messageId)}.${ext}`;
  await fs.writeFile(path.join(dir, file), Buffer.from(m[2], "base64"));
  return `${MEDIA_DIR}/${file}`;
}

export function indexEntryFor(archive: ChatArchive): ChatIndexEntry {
  const last = [...archive.messages].reverse().find((m) => m.kind === "message");
  return {
    folder: archive.folder,
    title: archive.title,
    isGroup: archive.isGroup,
    messages: archive.stats.messages,
    firstDate: archive.stats.firstDate,
    lastDate: archive.stats.lastDate,
    updatedAt: archive.updatedAt,
    firstSeen: archive.firstSeen,
    lastSeen: archive.lastSeen,
    presentInLatest: archive.presentInLatest,
    lastMessagePreview: last ? (last.text || `[${last.media?.type ?? "media"}]`).slice(0, 90) : "",
    lastMessageMs: last?.ts?.ms ?? 0,
  };
}

export function recomputeStats(archive: ChatArchive): ChatArchive {
  archive.stats = summarize(archive.messages);
  return archive;
}

/** Messages as the archive held them at (or before) a given version. */
export function messagesAsOf(messages: ArchivedMessage[], versionId: string): ArchivedMessage[] {
  return messages.filter((m) => !m.firstSeen || m.firstSeen <= versionId);
}

/**
 * Fold a fresh sweep into a chat's archive.
 *
 * Identity is WhatsApp's own `data-id`, which survives re-rendering. Messages
 * already held are updated in place (a later sweep can see reactions or an ack
 * the first pass missed) and stamped with the new `lastSeen`; messages never
 * seen before are inserted and stamped `firstSeen`. Nothing is ever dropped.
 */
export function mergeIntoArchive(
  existing: ArchivedMessage[],
  incoming: ArchivedMessage[],
  versionId: string
): { messages: ArchivedMessage[]; added: number; updated: number } {
  const byId = new Map<string, ArchivedMessage>();
  const sortKey = new Map<string, number>();

  // Undated rows (caption-less media) inherit the position of the row before
  // them, so they stay with their neighbours instead of sinking to the top.
  const keysFor = (list: ArchivedMessage[]): number[] => {
    let last = 0;
    return list.map((m) => {
      const ms = typeof m.ts?.ms === "number" ? m.ts.ms : last;
      last = ms;
      return ms;
    });
  };

  const existingKeys = keysFor(existing);
  existing.forEach((m, i) => {
    byId.set(m.id, m);
    sortKey.set(m.id, existingKeys[i]);
  });

  const incomingKeys = keysFor(incoming);
  let added = 0;
  let updated = 0;

  incoming.forEach((m, i) => {
    const prev = byId.get(m.id);
    if (prev) {
      const merged: ArchivedMessage = {
        ...prev,
        ...m,
        // never let a re-sweep blank out content we already hold
        text: m.text || prev.text,
        ts: m.ts ?? prev.ts,
        media: m.media?.file ? m.media : prev.media ?? m.media,
        firstSeen: prev.firstSeen ?? versionId,
        lastSeen: versionId,
      };
      byId.set(m.id, merged);
      updated++;
    } else {
      byId.set(m.id, { ...m, firstSeen: versionId, lastSeen: versionId });
      sortKey.set(m.id, incomingKeys[i]);
      added++;
    }
  });

  const all = [...byId.values()].sort(
    (a, b) => (sortKey.get(a.id) ?? 0) - (sortKey.get(b.id) ?? 0)
  );
  all.forEach((m, i) => {
    m.index = i;
  });

  return { messages: all, added, updated };
}

export function newChatArchive(
  title: string,
  folder: string,
  versionId: string,
  isGroup: boolean,
  dateOrder: string,
  selfName: string
): ChatArchive {
  const now = new Date().toISOString();
  return {
    title,
    folder,
    isGroup,
    dateOrder,
    selfName,
    createdAt: now,
    updatedAt: now,
    firstSeen: versionId,
    lastSeen: versionId,
    presentInLatest: true,
    stats: summarize([]),
    messages: [],
  };
}

/* ------------------------------------------------------------- versions -- */

export async function writeVersion(root: string, version: ArchiveVersion): Promise<void> {
  await writeJson(path.join(versionsPath(root), `${version.id}.json`), version);

  const index = await readIndex(root);
  // The index carries summaries only; the per-chat detail stays in the manifest.
  const summary: Omit<ArchiveVersion, "chats"> = {
    id: version.id,
    label: version.label,
    mode: version.mode,
    status: version.status,
    startedAt: version.startedAt,
    finishedAt: version.finishedAt,
    totals: version.totals,
    ...(version.error ? { error: version.error } : {}),
    ...(version.note ? { note: version.note } : {}),
  };
  const at = index.versions.findIndex((v) => v.id === version.id);
  if (at >= 0) index.versions[at] = summary;
  else index.versions.push(summary);
  index.versions.sort((a, b) => b.id.localeCompare(a.id)); // newest first
  await writeIndex(root, index);
}

export async function readVersion(root: string, id: string): Promise<ArchiveVersion | null> {
  if (!/^[\w-]+$/.test(id)) return null;
  return readJson<ArchiveVersion | null>(path.join(versionsPath(root), `${id}.json`), null);
}

export async function listVersions(root: string): Promise<Array<Omit<ArchiveVersion, "chats">>> {
  const index = await readIndex(root);
  return index.versions;
}

export function newVersion(id: string, mode: VersionMode, label?: string): ArchiveVersion {
  return {
    id,
    label: label || (mode === "full" ? "Full backup" : "Update"),
    mode,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    chats: [],
    totals: { chats: 0, added: 0, updated: 0, messages: 0 },
  };
}

/**
 * Record which chats WhatsApp still offered in this run. Chats that have
 * disappeared keep everything they had and are simply flagged, so a chat you
 * deleted on your phone stays readable here forever.
 */
export async function markPresence(
  root: string,
  seenTitles: string[],
  versionId: string
): Promise<{ vanished: string[] }> {
  const seen = new Set(seenTitles);
  const index = await readIndex(root);
  const vanished: string[] = [];

  for (const entry of index.chats) {
    const present = seen.has(entry.title);
    if (present) {
      entry.presentInLatest = true;
      entry.lastSeen = versionId;
    } else if (entry.presentInLatest) {
      entry.presentInLatest = false;
      vanished.push(entry.title);
    }
  }

  await writeIndex(root, index);

  // mirror the flag into each affected chat file
  for (const title of vanished) {
    const entry = index.chats.find((c) => c.title === title);
    if (!entry) continue;
    const archive = await readChat(root, entry.folder);
    if (archive && archive.presentInLatest) {
      archive.presentInLatest = false;
      await writeChat(root, archive);
    }
  }

  return { vanished };
}

export async function upsertIndexEntry(root: string, archive: ChatArchive): Promise<void> {
  const index = await readIndex(root);
  const entry = indexEntryFor(archive);
  const at = index.chats.findIndex((c) => c.folder === archive.folder);
  if (at >= 0) index.chats[at] = entry;
  else index.chats.push(entry);
  index.chats.sort((a, b) => b.lastMessageMs - a.lastMessageMs);
  await writeIndex(root, index);
}

// NOTE: server-only module.
import path from "path";
import { isLocalRuntime, readToolSettings } from "./settings";
import { chatDir, ensureArchive, readChat, readIndex, MEDIA_DIR } from "./vault";
import { readToken, isOneDriveConfigured } from "./onedrive/auth";
import { getBuffer, getJson } from "./onedrive/drive";
import type { ArchiveIndex, ArchiveVersion, ChatArchive } from "./types";
import { EMPTY_INDEX } from "./types";
import { promises as fs } from "fs";

/**
 * Where the archive is read from.
 *
 * Running on your own machine, the local folder is the truth. Running on the
 * deployed site there is no local disk, so the same archive is read out of the
 * OneDrive app folder the backups were mirrored into. Writing is always local —
 * backups need a browser, which a serverless host does not have.
 */
export type ArchiveSource = "local" | "onedrive" | "none";

export async function oneDriveLinked(): Promise<boolean> {
  if (!isOneDriveConfigured()) return false;
  return !!(await readToken());
}

export async function resolveSource(): Promise<ArchiveSource> {
  if (isLocalRuntime()) return "local";
  return (await oneDriveLinked()) ? "onedrive" : "none";
}

export async function loadIndex(): Promise<{ index: ArchiveIndex; source: ArchiveSource }> {
  const source = await resolveSource();
  if (source === "local") {
    const settings = await readToolSettings();
    await ensureArchive(settings.archiveRoot);
    return { index: await readIndex(settings.archiveRoot), source };
  }
  if (source === "onedrive") {
    const index = await getJson<ArchiveIndex>("archive.json");
    return { index: index ?? { ...EMPTY_INDEX }, source };
  }
  return { index: { ...EMPTY_INDEX }, source };
}

export async function loadChat(folder: string): Promise<ChatArchive | null> {
  const source = await resolveSource();
  if (source === "local") {
    const settings = await readToolSettings();
    return readChat(settings.archiveRoot, folder);
  }
  if (source === "onedrive") {
    return getJson<ChatArchive>(`chats/${folder}/chat.json`);
  }
  return null;
}

export async function loadVersion(id: string): Promise<ArchiveVersion | null> {
  if (!/^[\w-]+$/.test(id)) return null;
  const source = await resolveSource();
  if (source === "local") {
    const settings = await readToolSettings();
    const { readVersion } = await import("./vault");
    return readVersion(settings.archiveRoot, id);
  }
  if (source === "onedrive") {
    return getJson<ArchiveVersion>(`versions/${id}.json`);
  }
  return null;
}

export async function loadMedia(
  folder: string,
  file: string
): Promise<{ body: Buffer; size: number } | null> {
  // basename() so a crafted name cannot climb out of the media folder
  const safe = path.basename(file);
  const source = await resolveSource();

  if (source === "local") {
    const settings = await readToolSettings();
    const full = path.join(chatDir(settings.archiveRoot, folder), MEDIA_DIR, safe);
    try {
      const body = await fs.readFile(full);
      return { body, size: body.byteLength };
    } catch {
      return null;
    }
  }
  if (source === "onedrive") {
    const body = await getBuffer(`chats/${folder}/${MEDIA_DIR}/${safe}`);
    return body ? { body, size: body.byteLength } : null;
  }
  return null;
}

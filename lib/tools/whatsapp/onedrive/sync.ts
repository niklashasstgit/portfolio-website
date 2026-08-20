// NOTE: server-only module.
import { promises as fs } from "fs";
import path from "path";
import { putFile } from "./drive";

/**
 * Push the local archive into the OneDrive app folder.
 *
 * Deliberately a separate step rather than writing every message straight to
 * OneDrive: a sweep already takes minutes, and putting a network round-trip in
 * that loop would make backups both slower and far more fragile. The local
 * archive stays the working copy; this mirrors it afterwards.
 *
 * A small manifest records what was uploaded (size + mtime), so re-syncing
 * only sends what actually changed — otherwise every run would re-upload the
 * whole history.
 */

const MANIFEST = path.join(process.cwd(), ".data", "onedrive-sync.json");

type Manifest = Record<string, { size: number; mtimeMs: number }>;

const CONTENT_TYPES: Record<string, string> = {
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest), "utf8");
}

async function walk(dir: string, base: string, out: string[] = []): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

export interface SyncProgress {
  uploaded: number;
  skipped: number;
  total: number;
  current: string;
  bytes: number;
}

export async function syncArchiveUp(
  archiveRoot: string,
  opts: {
    onProgress?: (p: SyncProgress) => void;
    signal?: { cancelled: boolean };
    force?: boolean;
  } = {}
): Promise<{ uploaded: number; skipped: number; bytes: number; failed: string[] }> {
  const files = await walk(archiveRoot, archiveRoot);
  const manifest = opts.force ? {} : await readManifest();
  const failed: string[] = [];
  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;

  for (const rel of files) {
    if (opts.signal?.cancelled) break;

    const full = path.join(archiveRoot, rel);
    let stat;
    try {
      stat = await fs.stat(full);
    } catch {
      continue;
    }

    const seen = manifest[rel];
    if (seen && seen.size === stat.size && seen.mtimeMs === stat.mtimeMs) {
      skipped++;
      opts.onProgress?.({ uploaded, skipped, total: files.length, current: rel, bytes });
      continue;
    }

    try {
      const data = await fs.readFile(full);
      await putFile(rel, data, CONTENT_TYPES[path.extname(rel).toLowerCase()] ?? "application/octet-stream");
      manifest[rel] = { size: stat.size, mtimeMs: stat.mtimeMs };
      uploaded++;
      bytes += stat.size;
      // Persist as we go: a sync interrupted halfway should not start over.
      if (uploaded % 25 === 0) await writeManifest(manifest);
    } catch (err) {
      failed.push(`${rel}: ${(err as Error).message}`);
    }
    opts.onProgress?.({ uploaded, skipped, total: files.length, current: rel, bytes });
  }

  await writeManifest(manifest);
  return { uploaded, skipped, bytes, failed };
}

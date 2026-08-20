// NOTE: server-only module.
import { getAccessToken } from "./auth";

/**
 * Files inside this app's own OneDrive folder (`/me/drive/special/approot`).
 *
 * Every path here is relative to that folder, so nothing in this module can
 * reach the rest of the drive even if a path were crafted maliciously.
 */

const GRAPH = "https://graph.microsoft.com/v1.0";
/** Graph rejects a simple PUT above 4 MB; a big chat transcript passes that. */
const SIMPLE_UPLOAD_LIMIT = 4 * 1024 * 1024;

export interface DriveItemSummary {
  name: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
}

/** Encode each segment but keep the slashes Graph uses to walk the path. */
function encodePath(relPath: string): string {
  return relPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function itemUrl(relPath: string, suffix = ""): string {
  const clean = encodePath(relPath);
  return clean
    ? `${GRAPH}/me/drive/special/approot:/${clean}:${suffix ? suffix : ""}`
    : `${GRAPH}/me/drive/special/approot${suffix ? suffix : ""}`;
}

async function authorized(init: RequestInit = {}): Promise<RequestInit> {
  const token = await getAccessToken();
  return {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  };
}

async function graphFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, await authorized(init));
  if (res.status === 401) {
    // token could have been revoked between refresh and use — one retry
    const retry = await fetch(url, await authorized(init));
    if (!retry.ok && retry.status !== 404) {
      throw new Error(`OneDrive request failed (${retry.status}) for ${url}`);
    }
    return retry;
  }
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OneDrive request failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res;
}

/** Whoever the link belongs to — shown in settings so it is obvious. */
export async function accountName(): Promise<string> {
  const res = await graphFetch(`${GRAPH}/me?$select=displayName,userPrincipalName`);
  if (!res.ok) return "";
  const data = (await res.json()) as { displayName?: string; userPrincipalName?: string };
  return data.displayName || data.userPrincipalName || "";
}

export async function getBuffer(relPath: string): Promise<Buffer | null> {
  const res = await graphFetch(itemUrl(relPath, "/content"));
  if (res.status === 404) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function getJson<T>(relPath: string): Promise<T | null> {
  const buf = await getBuffer(relPath);
  if (!buf) return null;
  try {
    return JSON.parse(buf.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function stat(relPath: string): Promise<DriveItemSummary | null> {
  const res = await graphFetch(itemUrl(relPath));
  if (res.status === 404) return null;
  const data = (await res.json()) as {
    name: string;
    size: number;
    lastModifiedDateTime: string;
    folder?: unknown;
  };
  return {
    name: data.name,
    size: data.size,
    lastModified: data.lastModifiedDateTime,
    isFolder: !!data.folder,
  };
}

export async function listChildren(relPath: string): Promise<DriveItemSummary[]> {
  const res = await graphFetch(itemUrl(relPath, "/children?$select=name,size,folder,lastModifiedDateTime"));
  if (res.status === 404) return [];
  const data = (await res.json()) as {
    value?: Array<{ name: string; size: number; lastModifiedDateTime: string; folder?: unknown }>;
  };
  return (data.value ?? []).map((item) => ({
    name: item.name,
    size: item.size,
    lastModified: item.lastModifiedDateTime,
    isFolder: !!item.folder,
  }));
}

/** Upload, transparently switching to a chunked session for large files. */
export async function putFile(
  relPath: string,
  data: Buffer,
  contentType = "application/octet-stream"
): Promise<void> {
  if (data.byteLength <= SIMPLE_UPLOAD_LIMIT) {
    await graphFetch(itemUrl(relPath, "/content"), {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: new Uint8Array(data),
    });
    return;
  }

  const sessionRes = await graphFetch(itemUrl(relPath, "/createUploadSession"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item: { "@microsoft.graph.conflictBehavior": "replace" } }),
  });
  const session = (await sessionRes.json()) as { uploadUrl?: string };
  if (!session.uploadUrl) throw new Error("OneDrive did not return an upload session");

  // Chunks must be a multiple of 320 KiB, per Graph's upload rules.
  const chunkSize = 5 * 320 * 1024;
  for (let offset = 0; offset < data.byteLength; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, data.byteLength);
    const chunk = data.subarray(offset, end);
    const res = await fetch(session.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${offset}-${end - 1}/${data.byteLength}`,
      },
      body: new Uint8Array(chunk),
    });
    if (!res.ok && res.status !== 201 && res.status !== 202) {
      throw new Error(`chunk upload failed (${res.status}) at byte ${offset}`);
    }
  }
}

export async function deleteItem(relPath: string): Promise<void> {
  await graphFetch(itemUrl(relPath), { method: "DELETE" });
}

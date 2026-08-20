// Client-safe: fetch only, no node imports. Types are erased at build time.
import type { ArchiveIndex, ArchiveVersion, ChatArchive, ChatIndexEntry } from "./types";
import type { WhatsAppToolSettings } from "./settings";

export type { ArchiveIndex, ArchiveVersion, ChatArchive, ChatIndexEntry, WhatsAppToolSettings };

export interface SessionState {
  running: boolean;
  loggedIn: boolean;
  qrVisible?: boolean;
  error?: string;
}

export interface JobEventPayload {
  at: number;
  phase: string;
  [key: string]: unknown;
}

export interface JobView {
  id: string;
  kind: string;
  label: string;
  state: "queued" | "running" | "done" | "failed" | "cancelled";
  startedAt: string;
  finishedAt: string | null;
  result: unknown;
  error: string | null;
  events: JobEventPayload[];
}

export interface ToolState {
  settings: WhatsAppToolSettings;
  index: ArchiveIndex;
  session: SessionState;
  jobs: JobView[];
}

const BASE = "/api/tools/whatsapp";

export class ToolError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    const e = body as { error?: string; code?: string };
    throw new ToolError(e?.error ?? `HTTP ${res.status}`, res.status, e?.code);
  }
  return body as T;
}

export const toolsApi = {
  state: () => api<ToolState>("/state"),
  startSession: () =>
    api<SessionState>("/session", { method: "POST", body: JSON.stringify({ action: "start" }) }),
  stopSession: () =>
    api<SessionState>("/session", { method: "POST", body: JSON.stringify({ action: "stop" }) }),
  sessionStatus: () => api<SessionState>("/session"),

  startBackup: (params: { mode: "full" | "partial"; label?: string; chats?: string[]; media?: boolean }) =>
    api<JobView>("/backup", { method: "POST", body: JSON.stringify(params) }),
  job: (id: string) => api<JobView>(`/jobs/${encodeURIComponent(id)}`),
  cancelJob: (id: string) =>
    api<{ cancelled: boolean }>(`/jobs/${encodeURIComponent(id)}`, { method: "DELETE" }),

  chats: () =>
    api<{ chats: ChatIndexEntry[]; totals: { chats: number; messages: number }; updatedAt: string }>(
      "/chats"
    ),
  chat: (folder: string, version?: string | null) =>
    api<ChatArchive & { viewingVersion?: string }>(
      `/chats/${encodeURIComponent(folder)}${version ? `?version=${encodeURIComponent(version)}` : ""}`
    ),

  versions: () => api<{ versions: Array<Omit<ArchiveVersion, "chats">> }>("/versions"),
  version: (id: string) => api<ArchiveVersion>(`/versions/${encodeURIComponent(id)}`),

  settings: () => api<WhatsAppToolSettings>("/settings"),
  saveSettings: (patch: Partial<WhatsAppToolSettings>) =>
    api<{ settings: WhatsAppToolSettings; archiveOk: boolean; archiveError: string | null }>(
      "/settings",
      { method: "PUT", body: JSON.stringify(patch) }
    ),

  diagnose: () =>
    api<{
      loggedIn: boolean;
      counts: Record<string, number>;
      hints: { openInOtherTab: boolean; useHereButton: boolean; qrLikely: boolean; loading: boolean };
      chatList?: { strategy: string; rowsWithNames: number };
    }>("/diagnose"),
};

export function mediaUrl(folder: string, file: string): string {
  const name = file.split("/").pop() ?? file;
  return `${BASE}/chats/${encodeURIComponent(folder)}/media/${encodeURIComponent(name)}`;
}

/** Follow a job's server-sent events; returns an unsubscribe function. */
export function streamJob(
  id: string,
  onEvent: (ev: JobEventPayload) => void,
  onClose?: () => void
): () => void {
  const source = new EventSource(`${BASE}/jobs/${encodeURIComponent(id)}/stream`);
  source.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data) as JobEventPayload);
    } catch {
      /* ignore malformed frame */
    }
  };
  source.onerror = () => {
    source.close();
    onClose?.();
  };
  return () => source.close();
}

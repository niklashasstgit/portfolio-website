import type { Stamp } from "./dates";

/** Pure type module — safe to import from client components. */

export interface ArchivedMedia {
  type: string;
  filename?: string;
  duration?: string;
  mime?: string;
  bytes?: number;
  /** Path relative to the chat folder, e.g. "media/true_49….jpg". */
  file?: string;
}

export interface ArchivedMessage {
  id: string;
  index: number;
  kind: "message" | "system";
  type: string;
  direction: "in" | "out" | null;
  sender: string | null;
  text: string;
  ts: Stamp | null;
  media?: ArchivedMedia;
  quoted?: { author: string; text: string };
  reactions?: string[];
  deleted?: boolean;
  forwarded?: boolean;
  ack?: string;
  /** Version that first archived this message. Never changes. */
  firstSeen?: string;
  /** Most recent version in which WhatsApp still showed it. */
  lastSeen?: string;
}

export interface ChatStats {
  messages: number;
  system: number;
  outgoing: number;
  incoming: number;
  withMedia: number;
  firstDate: string | null;
  lastDate: string | null;
  byType: Record<string, number>;
  bySender: Record<string, number>;
}

export interface ChatArchive {
  title: string;
  folder: string;
  isGroup: boolean;
  dateOrder: string;
  selfName: string;
  createdAt: string;
  updatedAt: string;
  /** Version ids bounding this chat's presence in WhatsApp itself. */
  firstSeen: string;
  lastSeen: string;
  /** False once a sweep no longer finds the chat — the archive keeps it anyway. */
  presentInLatest: boolean;
  stats: ChatStats;
  messages: ArchivedMessage[];
}

/** One chat's outcome within a single backup run. */
export interface VersionChatEntry {
  title: string;
  folder: string;
  swept: number;
  added: number;
  updated: number;
  total: number;
  firstDate: string | null;
  lastDate: string | null;
  reachedStart: boolean;
  error?: string;
  skipped?: string;
}

export type VersionMode = "full" | "partial";
export type VersionStatus = "running" | "complete" | "failed" | "cancelled";

export interface ArchiveVersion {
  id: string;
  label: string;
  mode: VersionMode;
  status: VersionStatus;
  startedAt: string;
  finishedAt: string | null;
  chats: VersionChatEntry[];
  totals: { chats: number; added: number; updated: number; messages: number };
  error?: string;
  note?: string;
}

/** Lightweight per-chat row kept in the index so listing never reads every archive. */
export interface ChatIndexEntry {
  folder: string;
  title: string;
  isGroup: boolean;
  messages: number;
  firstDate: string | null;
  lastDate: string | null;
  updatedAt: string;
  firstSeen: string;
  lastSeen: string;
  presentInLatest: boolean;
  lastMessagePreview: string;
  lastMessageMs: number;
  /** Bytes on disk for this chat's folder (transcript + exports + media).
      Only knowable after a chat has been read once. */
  bytes: number;
  /** Version id of the run that last wrote this chat. */
  lastBackupVersion: string;
}

export interface ArchiveIndex {
  version: 1;
  updatedAt: string;
  chats: ChatIndexEntry[];
  versions: Array<Omit<ArchiveVersion, "chats">>;
  totals: { chats: number; messages: number };
}

export const EMPTY_INDEX: ArchiveIndex = {
  version: 1,
  updatedAt: "",
  chats: [],
  versions: [],
  totals: { chats: 0, messages: 0 },
};

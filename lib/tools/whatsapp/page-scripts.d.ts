/**
 * Type surface for the in-page scraper. The implementation lives in
 * page-scripts.js and is executed inside the WhatsApp Web page, so these
 * types describe the shape of `window.__WCE` rather than anything Node runs.
 */

export interface RawStamp {
  time: string;
  date: string;
  raw: string;
}

export interface RawMedia {
  type: string;
  thumb?: string;
  file?: string;
  filename?: string;
  duration?: string;
  mime?: string;
  bytes?: number;
  dataUrl?: string;
}

export interface RawMessage {
  id: string;
  kind: "message" | "system" | "date";
  outgoing?: boolean;
  sender?: string | null;
  stamp?: RawStamp | null;
  type?: string;
  text?: string;
  media?: RawMedia;
  quoted?: { author: string; text: string };
  reactions?: string[];
  deleted?: boolean;
  forwarded?: boolean;
  ack?: string;
}

export interface RawChatListItem {
  name: string;
  preview: string;
  unread: number;
  lastActivity: string;
  isGroup: boolean;
  muted: boolean;
  pinned: boolean;
  offsetY: number | null;
}

export declare function installScraper(): string;

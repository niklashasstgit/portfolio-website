import * as dates from "./dates";
import type { DateOrder } from "./dates";
import type { ArchivedMessage, ChatStats } from "./types";
import type { RawMessage } from "./page-scripts";

/**
 * Turns rows harvested from the DOM into a clean, dated timeline.
 *
 * Two things make this less trivial than it looks:
 *
 *  1. Media bubbles without a caption carry no `data-pre-plain-text`, so they
 *     have a time but no date. The date is carried forward from the last date
 *     divider or dated message — exactly how a human reads the screen.
 *  2. Day-first vs month-first is decided once per chat, never per message.
 */

export interface NormalizeOptions {
  chatTitle?: string;
  selfName?: string;
  dateOrder?: "auto" | DateOrder;
  ref?: Date;
}

export function normalize(
  rawMessages: RawMessage[],
  opts: NormalizeOptions = {}
): { messages: ArchivedMessage[]; dateOrder: DateOrder } {
  const ref = opts.ref ?? new Date();
  const rows = Array.isArray(rawMessages) ? rawMessages : [];

  const samples: string[] = [];
  for (const r of rows) {
    if (r?.stamp?.date) samples.push(r.stamp.date);
    if (r?.kind === "date" && r.text) samples.push(r.text);
  }
  const order: DateOrder =
    opts.dateOrder && opts.dateOrder !== "auto"
      ? opts.dateOrder
      : dates.detectOrder(samples, "DMY");

  const out: ArchivedMessage[] = [];
  let currentDate: dates.YMD | null = null;
  let index = 0;

  for (const row of rows) {
    if (!row) continue;

    if (row.kind === "date") {
      const d = dates.parseDate(row.text ?? "", order, ref);
      if (d) currentDate = d;
      continue; // dividers are redundant once every message carries a date
    }

    if (row.kind === "system") {
      out.push({
        index: index++,
        id: row.id,
        kind: "system",
        type: "system",
        direction: null,
        sender: null,
        text: (row.text ?? "").trim(),
        ts: currentDate ? dates.combine(currentDate, null) : null,
      });
      continue;
    }

    const stamp = row.stamp ?? { time: "", date: "", raw: "" };
    const parsedDate = stamp.date ? dates.parseDate(stamp.date, order, ref) : null;
    if (parsedDate) currentDate = parsedDate;
    const time = stamp.time ? dates.parseTime(stamp.time) : null;

    const msg: ArchivedMessage = {
      index: index++,
      id: row.id,
      kind: "message",
      type: row.type ?? "text",
      direction: row.outgoing ? "out" : "in",
      sender: row.sender || (row.outgoing ? opts.selfName ?? "You" : opts.chatTitle ?? null),
      text: typeof row.text === "string" ? row.text : "",
      ts: currentDate ? dates.combine(currentDate, time) : null,
    };

    if (row.media) {
      msg.media = {
        type: row.media.type,
        ...(row.media.filename ? { filename: row.media.filename } : {}),
        ...(row.media.duration ? { duration: row.media.duration } : {}),
        ...(row.media.mime ? { mime: row.media.mime } : {}),
        ...(row.media.bytes ? { bytes: row.media.bytes } : {}),
        ...(row.media.file ? { file: row.media.file } : {}),
      };
    }
    if (row.quoted) msg.quoted = row.quoted;
    if (row.reactions) msg.reactions = row.reactions;
    if (row.deleted) msg.deleted = true;
    if (row.forwarded) msg.forwarded = true;
    if (row.ack) msg.ack = row.ack;

    out.push(msg);
  }

  return { messages: out, dateOrder: order };
}

export function summarize(messages: ArchivedMessage[]): ChatStats {
  const stats: ChatStats = {
    messages: 0,
    system: 0,
    outgoing: 0,
    incoming: 0,
    withMedia: 0,
    firstDate: null,
    lastDate: null,
    byType: {},
    bySender: {},
  };

  for (const m of messages) {
    if (m.kind === "system") {
      stats.system++;
    } else {
      stats.messages++;
      stats.byType[m.type] = (stats.byType[m.type] ?? 0) + 1;
      const who = m.sender ?? (m.direction === "out" ? "You" : "Unknown");
      stats.bySender[who] = (stats.bySender[who] ?? 0) + 1;
      if (m.direction === "out") stats.outgoing++;
      else stats.incoming++;
      if (m.media) stats.withMedia++;
    }
    if (m.ts?.date) {
      if (!stats.firstDate || m.ts.date < stats.firstDate) stats.firstDate = m.ts.date;
      if (!stats.lastDate || m.ts.date > stats.lastDate) stats.lastDate = m.ts.date;
    }
  }
  return stats;
}

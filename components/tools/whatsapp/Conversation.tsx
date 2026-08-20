"use client";

import { mediaUrl } from "@/lib/tools/whatsapp/client";
import type { ArchivedMessage } from "@/lib/tools/whatsapp/types";

/** Renders an archived transcript as WhatsApp-style bubbles, grouped by day. */
export default function Conversation({
  messages,
  folder,
  isGroup,
}: {
  messages: ArchivedMessage[];
  folder: string;
  isGroup: boolean;
}) {
  const out: React.ReactNode[] = [];
  let day: string | null = null;

  for (const m of messages) {
    const date = m.ts?.date ?? "undated";
    if (date !== day) {
      day = date;
      out.push(
        <div key={`day-${date}-${m.id}`} className="my-3 text-center">
          <span className="rounded-lg bg-fg/10 px-2.5 py-1 font-mono-tight text-[10px] text-fg-muted">
            {date}
          </span>
        </div>
      );
    }

    if (m.kind === "system") {
      out.push(
        <div key={m.id} className="my-2 text-center">
          <span className="inline-block max-w-[80%] rounded-lg bg-fg/10 px-2.5 py-1 text-[11px] text-fg-muted">
            {m.text}
          </span>
        </div>
      );
      continue;
    }

    const mine = m.direction === "out";
    out.push(
      <div key={m.id} className={`my-0.5 flex ${mine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[78%] whitespace-pre-wrap break-words rounded-lg px-2.5 py-1.5 text-sm ${
            mine ? "bg-accent/20 text-fg" : "bg-fg/10 text-fg"
          }`}
        >
          {isGroup && !mine && m.sender && (
            <div className="mb-0.5 text-xs font-semibold text-accent">{m.sender}</div>
          )}

          {m.quoted && (
            <div className="mb-1 border-l-2 border-accent/70 bg-fg/5 px-2 py-1 text-xs text-fg-muted">
              <b>{m.quoted.author}</b>
              <br />
              {m.quoted.text}
            </div>
          )}

          {m.media?.file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(folder, m.media.file)}
              alt=""
              loading="lazy"
              className="my-1 max-w-[260px] rounded-md"
            />
          ) : m.media && m.media.type !== "text" ? (
            <div className="text-xs italic text-fg-muted">
              [{m.media.filename ?? m.media.type}
              {m.media.duration ? ` · ${m.media.duration}` : ""}]
            </div>
          ) : null}

          {m.deleted && (
            <span className="text-xs italic text-fg-muted">deleted in WhatsApp · kept here</span>
          )}

          {m.text}

          {m.reactions?.length ? (
            <div className="mt-1 inline-block rounded-full bg-fg/10 px-1.5 text-[11px]">
              {m.reactions.join(" ")}
            </div>
          ) : null}

          {m.ts?.hasTime && (
            <span className="float-right ml-2 mt-1.5 font-mono-tight text-[10px] text-fg-muted">
              {m.ts.time}
            </span>
          )}
        </div>
      </div>
    );
  }

  return <>{out}</>;
}

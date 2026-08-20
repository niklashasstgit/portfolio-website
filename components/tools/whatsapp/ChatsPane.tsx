"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Conversation from "./Conversation";
import {
  toolsApi,
  type ArchiveVersion,
  type ChatArchive,
  type ChatIndexEntry,
} from "@/lib/tools/whatsapp/client";

/** Chat list on the left, conversation on the right — read-only, like WhatsApp. */
export default function ChatsPane({
  chats,
  versions,
}: {
  chats: ChatIndexEntry[];
  versions: Array<Omit<ArchiveVersion, "chats">>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [archive, setArchive] = useState<ChatArchive | null>(null);
  const [loading, setLoading] = useState(false);
  const [listQuery, setListQuery] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [asOf, setAsOf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const visibleChats = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
  }, [chats, listQuery]);

  const loadChat = useCallback(async (folder: string, version: string) => {
    setSelected(folder);
    setLoading(true);
    setError(null);
    try {
      setArchive(await toolsApi.chat(folder, version || null));
    } catch (err) {
      setError((err as Error).message);
      setArchive(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Land at the newest message, the way a chat app opens.
  useEffect(() => {
    if (archive && !chatQuery && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [archive, chatQuery]);

  const shown = useMemo(() => {
    if (!archive) return [];
    const q = chatQuery.trim().toLowerCase();
    if (!q) return archive.messages;
    return archive.messages.filter(
      (m) => (m.text ?? "").toLowerCase().includes(q) || (m.sender ?? "").toLowerCase().includes(q)
    );
  }, [archive, chatQuery]);

  if (!chats.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-fg-muted">
        Nothing archived yet. Run your first backup from the <b className="text-fg">Backups</b> tab.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-line bg-bg-raised">
        <div className="border-b border-line p-3">
          <input
            type="search"
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            placeholder="Search chats…"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="max-h-[62vh] overflow-y-auto">
          {visibleChats.map((c) => (
            <button
              key={c.folder}
              onClick={() => {
                setChatQuery("");
                void loadChat(c.folder, asOf);
              }}
              className={`flex w-full flex-col gap-0.5 border-b border-line px-3 py-2.5 text-left transition-colors hover:bg-fg/5 ${
                selected === c.folder ? "bg-fg/5" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="truncate text-sm text-fg">{c.title}</span>
                {c.isGroup && (
                  <span className="rounded-full border border-line px-1.5 text-[10px] text-fg-muted">
                    group
                  </span>
                )}
                {!c.presentInLatest && (
                  <span
                    title="No longer in WhatsApp — kept here"
                    className="rounded-full border border-amber-500/40 px-1.5 text-[10px] text-amber-400"
                  >
                    gone
                  </span>
                )}
              </span>
              <span className="truncate text-xs text-fg-muted">{c.lastMessagePreview || "—"}</span>
              <span className="font-mono-tight text-[10px] text-fg-muted">
                {c.messages.toLocaleString()} msgs{c.lastDate ? ` · to ${c.lastDate}` : ""}
              </span>
            </button>
          ))}
          {!visibleChats.length && (
            <p className="p-6 text-center text-xs text-fg-muted">No chat matches that.</p>
          )}
        </div>
      </aside>

      <section className="flex min-h-[62vh] flex-col rounded-2xl border border-line bg-bg-raised">
        {!archive && !loading && !error && (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-fg-muted">
            Pick a chat to read it.
          </div>
        )}
        {loading && (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-fg-muted">
            Loading…
          </div>
        )}
        {error && <div className="p-6 text-sm text-red-400">{error}</div>}

        {archive && !loading && (
          <>
            <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line p-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-fg">{archive.title}</h2>
                <p className="font-mono-tight text-[10px] text-fg-muted">
                  {archive.stats.messages.toLocaleString()} messages
                  {archive.stats.firstDate
                    ? ` · ${archive.stats.firstDate} → ${archive.stats.lastDate}`
                    : ""}
                  {` · ${archive.stats.outgoing} sent / ${archive.stats.incoming} received`}
                </p>
              </div>
              <select
                value={asOf}
                onChange={(e) => {
                  const next = e.target.value;
                  setAsOf(next);
                  if (selected) void loadChat(selected, next);
                }}
                title="Rewind the archive to an earlier backup"
                className="rounded-lg border border-line bg-bg px-2 py-1.5 text-xs text-fg outline-none focus:border-accent"
              >
                <option value="">Everything archived</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    As of {v.id.replace("_", " ")} ({v.mode})
                  </option>
                ))}
              </select>
              <input
                type="search"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Search in chat…"
                className="w-40 rounded-lg border border-line bg-bg px-2 py-1.5 text-xs text-fg outline-none focus:border-accent"
              />
            </header>

            {asOf && (
              <p className="border-b border-line bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-300">
                Showing the archive as it stood after backup {asOf} — anything added later is hidden.
              </p>
            )}

            <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-3">
              <Conversation messages={shown} folder={archive.folder} isGroup={archive.isGroup} />
              {!shown.length && (
                <p className="p-8 text-center text-xs text-fg-muted">Nothing matches that search.</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

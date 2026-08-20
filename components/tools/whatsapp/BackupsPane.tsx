"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BatchPlanner from "./BatchPlanner";
import {
  streamJob,
  toolsApi,
  type ArchiveVersion,
  type JobEventPayload,
  type JobView,
} from "@/lib/tools/whatsapp/client";

/** Describe one progress event in a sentence a human wants to read. */
function describe(ev: JobEventPayload): string | null {
  const s = (k: string) => (typeof ev[k] === "string" ? (ev[k] as string) : "");
  const n = (k: string) => (typeof ev[k] === "number" ? (ev[k] as number) : 0);
  switch (ev.phase) {
    case "started":
      return "Starting…";
    case "archive":
      return `Archive: ${s("root")}`;
    case "login-needed":
      return "Waiting for you to scan the QR code in the browser window…";
    case "linked":
      return "WhatsApp linked.";
    case "chats":
      return `Reading your chat list… ${n("found")} found`;
    case "plan":
      return `${n("total")} chats to back up.`;
    case "version":
      return `Backup ${s("id")} started.`;
    case "chat-start":
      return `(${n("index")}/${n("total")}) ${s("title")}…`;
    case "chat-progress":
      return `(${n("index")}/${n("total")}) ${s("title")} — ${n("collected")} messages read${
        ev.atTop ? ", reached the start" : ""
      }`;
    case "chat-done":
      return `(${n("index")}/${n("total")}) ${s("title")} — +${n("added")} new, ${n("messages")} total`;
    case "chat-failed":
      return `${s("title")} failed: ${s("error")}`;
    case "vanished":
      return `No longer in WhatsApp (kept in the archive): ${
        Array.isArray(ev.chats) ? (ev.chats as string[]).join(", ") : ""
      }`;
    case "finished":
      return "Backup complete.";
    case "cancelling":
      return "Stopping after this chat…";
    default:
      return null;
  }
}

export default function BackupsPane({
  versions,
  onArchiveChanged,
}: {
  versions: Array<Omit<ArchiveVersion, "chats">>;
  onArchiveChanged: () => void;
}) {
  const [job, setJob] = useState<JobView | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("");
  const [media, setMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ArchiveVersion | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const push = useCallback((text: string) => {
    setLines((prev) => [...prev.slice(-400), text]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  useEffect(() => () => stopRef.current?.(), []);

  const follow = useCallback(
    (id: string) => {
      stopRef.current?.();
      stopRef.current = streamJob(id, (ev) => {
        const text = describe(ev);
        if (text) {
          setCurrent(text);
          push(text);
        }
        if (ev.phase === "done" || ev.phase === "failed" || ev.phase === "cancelled") {
          setRunning(false);
          if (ev.phase === "failed") setError(String(ev.error ?? "Backup failed."));
          setCurrent(
            ev.phase === "done" ? "Finished." : ev.phase === "cancelled" ? "Stopped." : "Failed."
          );
          onArchiveChanged();
        }
      });
    },
    [push, onArchiveChanged]
  );

  const start = async (mode: "full" | "partial") => {
    setError(null);
    setLines([]);
    setRunning(true);
    setCurrent("Starting…");
    try {
      const started = await toolsApi.startBackup({ mode, label: label.trim() || undefined, media });
      setJob(started);
      follow(started.id);
    } catch (err) {
      setRunning(false);
      setError((err as Error).message);
    }
  };

  const cancel = async () => {
    if (job) await toolsApi.cancelJob(job.id).catch(() => {});
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <BatchPlanner onArchiveChanged={onArchiveChanged} />

        <section className="rounded-2xl border border-line bg-bg-raised p-5">
          <h2 className="text-base font-semibold text-fg">Run everything at once</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Both kinds write into the same archive and neither ever deletes anything. An update
            simply stops as soon as it reaches messages you already have.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional), e.g. before phone swap"
              className="min-w-[220px] flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <label className="flex items-center gap-2 text-xs text-fg-muted">
              <input type="checkbox" checked={media} onChange={(e) => setMedia(e.target.checked)} />
              save image thumbnails
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => start("partial")}
              disabled={running}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Update archive
            </button>
            <button
              onClick={() => start("full")}
              disabled={running}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-accent disabled:opacity-50"
            >
              New full backup
            </button>
            {running && (
              <button
                onClick={cancel}
                className="rounded-full border border-red-500/50 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                Stop
              </button>
            )}
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3">
              <dt className="text-xs font-semibold text-fg">Update</dt>
              <dd className="mt-1 text-xs text-fg-muted">
                Walks back only until it meets messages already archived. Quick — run this often.
              </dd>
            </div>
            <div className="rounded-xl border border-line p-3">
              <dt className="text-xs font-semibold text-fg">Full backup</dt>
              <dd className="mt-1 text-xs text-fg-muted">
                Re-reads every chat to its very beginning and records a complete snapshot. Slow;
                worth it occasionally.
              </dd>
            </div>
          </dl>
        </section>

        {(running || lines.length > 0) && (
          <section className="rounded-2xl border border-line bg-bg-raised p-5">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${running ? "animate-pulse bg-accent" : "bg-fg-muted"}`}
              />
              <p className="flex-1 text-sm text-fg">{current}</p>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <div
              ref={logRef}
              className="mt-3 h-52 overflow-y-auto rounded-xl border border-line bg-bg p-3 font-mono-tight text-[11px] leading-5 text-fg-muted"
            >
              {lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="rounded-2xl border border-line bg-bg-raised">
        <h2 className="border-b border-line p-4 text-sm font-semibold text-fg">
          Backup history{versions.length ? ` · ${versions.length}` : ""}
        </h2>
        <div className="max-h-[60vh] overflow-y-auto">
          {!versions.length && <p className="p-6 text-center text-xs text-fg-muted">No backups yet.</p>}
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => toolsApi.version(v.id).then(setDetail).catch(() => setDetail(null))}
              className="block w-full border-b border-line p-3 text-left transition-colors hover:bg-fg/5"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono-tight text-xs text-fg">{v.id.replace("_", " ")}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    v.mode === "full" ? "bg-accent/15 text-accent" : "border border-line text-fg-muted"
                  }`}
                >
                  {v.mode}
                </span>
                {v.status !== "complete" && (
                  <span className="text-[10px] text-amber-400">{v.status}</span>
                )}
              </div>
              <div className="mt-1 text-xs text-fg-muted">
                {v.label} · +{v.totals.added} new across {v.totals.chats} chats
              </div>
            </button>
          ))}
        </div>
      </aside>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl border border-line bg-bg-raised p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-fg">
              {detail.label} · {detail.id.replace("_", " ")}
            </h3>
            <p className="mt-1 text-xs text-fg-muted">{detail.note}</p>
            <p className="mt-2 font-mono-tight text-[11px] text-fg-muted">
              {detail.totals.chats} chats · +{detail.totals.added} new · {detail.totals.messages} archived
            </p>
            <table className="mt-3 w-full text-left text-xs">
              <thead className="text-fg-muted">
                <tr>
                  <th className="pb-1">Chat</th>
                  <th className="pb-1 text-right">New</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.chats.map((c) => (
                  <tr key={c.folder || c.title} className="border-t border-line">
                    <td className="py-1 pr-2 text-fg">
                      {c.title}
                      {c.error && <span className="ml-1 text-red-400">· {c.error}</span>}
                    </td>
                    <td className="py-1 text-right text-fg-muted">{c.added}</td>
                    <td className="py-1 text-right text-fg-muted">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setDetail(null)}
              className="mt-4 w-full rounded-full border border-line px-4 py-2 text-sm text-fg hover:border-accent"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

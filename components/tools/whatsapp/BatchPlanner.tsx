"use client";

import { useMemo, useRef, useState } from "react";
import {
  streamJob,
  toolsApi,
  type ChatScanResult,
  type JobEventPayload,
  type PlannedChat,
} from "@/lib/tools/whatsapp/client";

type SortKey = "size" | "name" | "unread" | "new-first";

function mb(bytes: number): string {
  if (!bytes) return "—";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Plan a long backup as a series of small runs.
 *
 * A full sweep of every chat can take hours, so this scans the list once, shows
 * what each chat costs (measured on disk — WhatsApp exposes no size at all
 * until a chat has been read), and then takes them a batch at a time.
 */
export default function BatchPlanner({ onArchiveChanged }: { onArchiveChanged: () => void }) {
  const [scan, setScan] = useState<ChatScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [sort, setSort] = useState<SortKey>("new-first");
  const [batchSize, setBatchSize] = useState(5);
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [done, setDone] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const ordered = useMemo(() => {
    const list = (scan?.chats ?? []).filter((c) => !c.excluded);
    const size = (c: PlannedChat) => c.archived?.bytes ?? 0;
    const copy = [...list];
    if (sort === "size") copy.sort((a, b) => size(b) - size(a));
    else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "unread") copy.sort((a, b) => b.unread - a.unread);
    else copy.sort((a, b) => Number(!!a.archived) - Number(!!b.archived)); // never archived first
    return copy;
  }, [scan, sort]);

  const doneSet = useMemo(() => new Set(done), [done]);
  const pending = ordered.filter((c) => !doneSet.has(c.name));
  const nextBatch = pending.slice(0, Math.max(1, batchSize));
  const totalBytes = ordered.reduce((n, c) => n + (c.archived?.bytes ?? 0), 0);
  const batchBytes = nextBatch.reduce((n, c) => n + (c.archived?.bytes ?? 0), 0);

  const runScan = async () => {
    setScanning(true);
    setError(null);
    setStatus("Reading your chat list…");
    try {
      const job = await toolsApi.scanChats();
      stopRef.current?.();
      stopRef.current = streamJob(job.id, (ev: JobEventPayload) => {
        if (ev.phase === "chats") setStatus(`Reading your chat list… ${ev.found} found`);
        if (ev.phase === "login-needed") setStatus("Scan the QR code in the browser window…");
        if (ev.phase === "done") {
          setScan(ev.result as ChatScanResult);
          setStatus(null);
          setScanning(false);
        }
        if (ev.phase === "failed") {
          setError(String(ev.error ?? "Scan failed."));
          setStatus(null);
          setScanning(false);
        }
      });
    } catch (err) {
      setError((err as Error).message);
      setScanning(false);
      setStatus(null);
    }
  };

  const runBatch = async () => {
    if (!nextBatch.length) return;
    setRunning(true);
    setError(null);
    const names = nextBatch.map((c) => c.name);
    setStatus(`Backing up ${names.length} chats…`);
    try {
      const job = await toolsApi.startBackup({
        mode,
        chats: names,
        label: `Batch of ${names.length}`,
      });
      stopRef.current?.();
      stopRef.current = streamJob(job.id, (ev: JobEventPayload) => {
        if (ev.phase === "chat-start") {
          setStatus(`(${ev.index}/${ev.total}) ${ev.title}…`);
        } else if (ev.phase === "chat-progress") {
          setStatus(`(${ev.index}/${ev.total}) ${ev.title} — ${ev.collected} messages`);
        } else if (ev.phase === "done") {
          setDone((prev) => [...prev, ...names]);
          setStatus(`Batch finished — ${names.length} chats.`);
          setRunning(false);
          onArchiveChanged();
          void runScan();
        } else if (ev.phase === "failed" || ev.phase === "cancelled") {
          setError(String(ev.error ?? "Batch stopped."));
          setRunning(false);
          onArchiveChanged();
        }
      });
    } catch (err) {
      setError((err as Error).message);
      setRunning(false);
    }
  };

  const field =
    "rounded-lg border border-line bg-bg px-2 py-1.5 text-xs text-fg outline-none focus:border-accent";

  return (
    <section className="rounded-2xl border border-line bg-bg-raised p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-fg">Back up in batches</h2>
          <p className="mt-1 text-sm text-fg-muted">
            A full sweep of everything can run for hours. Scan the list once, then take it a few
            chats at a time — stop and continue whenever you like.
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning || running}
          className="rounded-full border border-line px-4 py-2 text-xs text-fg transition-colors hover:border-accent disabled:opacity-50"
        >
          {scan ? "Rescan" : "Scan chats"}
        </button>
      </div>

      {status && <p className="mt-3 text-xs text-fg-muted">{status}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {scan && (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-xs text-fg-muted">
              Chats per batch
              <input
                type="number"
                min={1}
                max={200}
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value) || 1))}
                className={`ml-2 w-20 ${field}`}
              />
            </label>
            <label className="text-xs text-fg-muted">
              Order
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`ml-2 ${field}`}
              >
                <option value="new-first">Never archived first</option>
                <option value="size">Largest first</option>
                <option value="name">Name</option>
                <option value="unread">Unread first</option>
              </select>
            </label>
            <label className="text-xs text-fg-muted">
              Depth
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "full" | "partial")}
                className={`ml-2 ${field}`}
              >
                <option value="full">Full history</option>
                <option value="partial">Only new messages</option>
              </select>
            </label>
            <button
              onClick={runBatch}
              disabled={running || scanning || !nextBatch.length}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {running
                ? "Running…"
                : nextBatch.length
                  ? `Back up next ${nextBatch.length}`
                  : "All done"}
            </button>
          </div>

          <p className="mt-3 font-mono-tight text-[11px] text-fg-muted">
            {ordered.length} chats · {done.length} done this session · {pending.length} to go ·{" "}
            {mb(totalBytes)} archived so far
            {batchBytes ? ` · next batch previously ${mb(batchBytes)}` : ""}
          </p>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-bg-raised text-fg-muted">
                <tr>
                  <th className="px-3 py-2">Chat</th>
                  <th className="px-3 py-2 text-right">Messages</th>
                  <th className="px-3 py-2 text-right">Size</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c, i) => {
                  const inNext = nextBatch.some((n) => n.name === c.name);
                  return (
                    <tr
                      key={c.name}
                      className={`border-t border-line ${inNext ? "bg-accent/8" : ""}`}
                    >
                      <td className="px-3 py-1.5 text-fg">
                        <span className="text-fg-muted">{i + 1}.</span> {c.name}
                        {c.isGroup && <span className="ml-1 text-fg-muted">(group)</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right text-fg-muted">
                        {c.archived ? c.archived.messages.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right text-fg-muted">
                        {c.archived ? mb(c.archived.bytes) : "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        {doneSet.has(c.name) ? (
                          <span className="text-accent">done</span>
                        ) : c.archived ? (
                          <span className="text-fg-muted">archived {c.archived.lastDate ?? ""}</span>
                        ) : (
                          <span className="text-amber-400">never</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {scan.vanished.length > 0 && (
            <p className="mt-3 text-[11px] text-fg-muted">
              Kept but no longer in WhatsApp: {scan.vanished.map((v) => v.name).join(", ")}
            </p>
          )}
          <p className="mt-2 text-[11px] text-fg-muted">
            Sizes are what each chat actually takes on disk. WhatsApp gives no size hint, so a chat
            reads “—” until it has been backed up once.
          </p>
        </>
      )}
    </section>
  );
}

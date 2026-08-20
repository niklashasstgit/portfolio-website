"use client";

import { useCallback, useEffect, useState } from "react";
import BackupsPane from "./BackupsPane";
import ChatsPane from "./ChatsPane";
import SettingsPane from "./SettingsPane";
import {
  toolsApi,
  type ArchiveIndex,
  type ArchiveVersion,
  type ChatIndexEntry,
  type OneDriveStatus,
  type SessionState,
  type WhatsAppToolSettings,
} from "@/lib/tools/whatsapp/client";

type Tab = "chats" | "backups" | "settings";

export interface InitialToolState {
  /** Null when reading a remote archive — settings only exist on the machine
      that actually runs backups. */
  settings: WhatsAppToolSettings | null;
  index: ArchiveIndex;
  session: SessionState;
  /** True when serving the archive from OneDrive: viewing only. */
  readOnly: boolean;
  oneDrive: OneDriveStatus;
}

/** The archive arrives as props from the server component — no fetch on mount. */
export default function WhatsAppTool({ initial }: { initial: InitialToolState }) {
  const [tab, setTab] = useState<Tab>("chats");
  const [settings, setSettings] = useState<WhatsAppToolSettings | null>(initial.settings);
  const [chats, setChats] = useState<ChatIndexEntry[]>(initial.index.chats);
  const [versions, setVersions] = useState<Array<Omit<ArchiveVersion, "chats">>>(
    initial.index.versions
  );
  const [totals, setTotals] = useState(initial.index.totals);
  const [session, setSession] = useState<SessionState>(initial.session);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await toolsApi.state();
      if (state.settings) setSettings(state.settings);
      setChats(state.index.chats);
      setVersions(state.index.versions);
      setTotals(state.index.totals);
      setSession(state.session);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // Keep the session light in view while the browser is open. Only the status
  // is polled — a backup may be writing the archive.
  useEffect(() => {
    if (!session.running) return;
    const timer = setInterval(() => {
      toolsApi
        .sessionStatus()
        .then(setSession)
        .catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [session.running]);

  const toggleSession = async () => {
    setBusy(true);
    setNotice(null);
    try {
      setSession(session.running ? await toolsApi.stopSession() : await toolsApi.startSession());
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const diagnose = async () => {
    setBusy(true);
    setNotice("Inspecting the WhatsApp page…");
    try {
      const report = await toolsApi.diagnose();
      if (!report.loggedIn) {
        setNotice("Not linked yet — scan the QR code in the browser window.");
      } else if (report.hints.openInOtherTab || report.hints.useHereButton) {
        setNotice(
          'WhatsApp is open in another tab. Close it, or click "Use here" in the tool window.'
        );
      } else if (report.chatList?.rowsWithNames) {
        setNotice(
          `Chat list readable: ${report.chatList.rowsWithNames} rows via the "${report.chatList.strategy}" strategy.`
        );
      } else {
        setNotice(
          "The chat list is on screen but no rows matched — WhatsApp may have changed its markup."
        );
      }
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const dot = session.loggedIn ? "bg-accent" : session.running ? "bg-amber-400" : "bg-fg-muted";
  const sessionLabel = session.loggedIn
    ? "WhatsApp linked"
    : session.running
      ? session.qrVisible
        ? "Scan the QR code in the browser window"
        : "Browser open, waiting for WhatsApp"
      : "Browser not running";

  return (
    <div className="space-y-5">
      {initial.readOnly && (
        <p className="rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-xs text-fg-muted">
          Reading your archive from OneDrive. Backups run on the machine with the browser — open
          this page there to capture new messages.
        </p>
      )}

      <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-bg-raised px-4 py-3">
        {!initial.readOnly && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />}
        <span className="flex-1 text-sm text-fg-muted">
          {initial.readOnly ? "Archive loaded from OneDrive" : sessionLabel}
        </span>
        <span className="font-mono-tight text-[11px] text-fg-muted">
          {totals.chats} chats · {totals.messages.toLocaleString()} messages archived
        </span>
        {!initial.readOnly && (
        <button
          onClick={toggleSession}
          disabled={busy}
          className="rounded-full border border-line px-4 py-1.5 text-xs text-fg transition-colors hover:border-accent disabled:opacity-50"
        >
          {session.running ? "Close browser" : "Link WhatsApp"}
        </button>
        )}
        {!initial.readOnly && (
        <button
          onClick={diagnose}
          disabled={busy}
          className="rounded-full border border-line px-4 py-1.5 text-xs text-fg-muted transition-colors hover:border-accent hover:text-fg disabled:opacity-50"
        >
          Diagnose
        </button>
        )}
      </header>

      {notice && (
        <p className="rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-xs text-fg-muted">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-bg-raised px-4 py-2.5 text-xs text-red-400">
          {error}
        </p>
      )}

      <nav className="flex gap-1 border-b border-line">
        {(
          (initial.readOnly
            ? [["chats", `Chats${chats.length ? ` (${chats.length})` : ""}`]]
            : [
                ["chats", `Chats${chats.length ? ` (${chats.length})` : ""}`],
                ["backups", `Backups${versions.length ? ` (${versions.length})` : ""}`],
                ["settings", "Settings"],
              ]) as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === key
                ? "border-accent font-medium text-fg"
                : "border-transparent text-fg-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "chats" && <ChatsPane chats={chats} versions={versions} />}
      {tab === "backups" && !initial.readOnly && (
        <BackupsPane versions={versions} onArchiveChanged={() => void refresh()} />
      )}
      {tab === "settings" && !initial.readOnly && settings && (
        <SettingsPane settings={settings} oneDrive={initial.oneDrive} onSaved={setSettings} />
      )}
    </div>
  );
}

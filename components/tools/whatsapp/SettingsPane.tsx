"use client";

import { useState } from "react";
import { toolsApi, type WhatsAppToolSettings } from "@/lib/tools/whatsapp/client";

/** Where the archive lives and how sweeps behave. */
export default function SettingsPane({
  settings,
  onSaved,
}: {
  settings: WhatsAppToolSettings;
  onSaved: (next: WhatsAppToolSettings) => void;
}) {
  const [draft, setDraft] = useState<WhatsAppToolSettings>(settings);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof WhatsAppToolSettings>(key: K, value: WhatsAppToolSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setBusy(true);
    setNote(null);
    setError(null);
    try {
      const res = await toolsApi.saveSettings(draft);
      setDraft(res.settings);
      onSaved(res.settings);
      setNote(
        res.archiveOk
          ? `Saved. Archive folder is writable.`
          : `Saved, but the archive folder could not be opened: ${res.archiveError}`
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent";

  return (
    <div className="max-w-2xl space-y-5">
      <section className="rounded-2xl border border-line bg-bg-raised p-5">
        <h2 className="text-base font-semibold text-fg">Where backups are stored</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Point this at a OneDrive folder and every backup is mirrored off this machine
          automatically. Each chat also gets a <code>chat.html</code> you can open on a phone
          straight from the OneDrive app, with no server involved.
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-fg">Archive folder</span>
          <input
            value={draft.archiveRoot}
            onChange={(e) => set("archiveRoot", e.target.value)}
            spellCheck={false}
            className={`mt-1 ${field} font-mono-tight text-xs`}
          />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-medium text-fg">Browser profile (holds the WhatsApp login)</span>
          <input
            value={draft.profileDir}
            onChange={(e) => set("profileDir", e.target.value)}
            spellCheck={false}
            className={`mt-1 ${field} font-mono-tight text-xs`}
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={draft.exports}
            onChange={(e) => set("exports", e.target.checked)}
          />
          also write chat.txt and chat.html next to each archive
        </label>
      </section>

      <section className="rounded-2xl border border-line bg-bg-raised p-5">
        <h2 className="text-base font-semibold text-fg">How sweeps behave</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-fg">Messages per chat (0 = all)</span>
            <input
              type="number"
              min={0}
              step={500}
              value={draft.messageLimit}
              onChange={(e) => set("messageLimit", Number(e.target.value))}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fg">Update stops after N known messages</span>
            <input
              type="number"
              min={10}
              step={10}
              value={draft.partialStopAfterKnown}
              onChange={(e) => set("partialStopAfterKnown", Number(e.target.value))}
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fg">Browser</span>
            <select
              value={draft.browser}
              onChange={(e) => set("browser", e.target.value as WhatsAppToolSettings["browser"])}
              className={`mt-1 ${field}`}
            >
              <option value="chrome">Google Chrome</option>
              <option value="msedge">Microsoft Edge</option>
              <option value="chromium">Bundled Chromium</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-fg">Date format</span>
            <select
              value={draft.dateOrder}
              onChange={(e) => set("dateOrder", e.target.value as WhatsAppToolSettings["dateOrder"])}
              className={`mt-1 ${field}`}
            >
              <option value="auto">Detect per chat</option>
              <option value="DMY">Day first (31/12/2026)</option>
              <option value="MDY">Month first (12/31/2026)</option>
              <option value="YMD">Year first (2026-12-31)</option>
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={draft.media}
              onChange={(e) => set("media", e.target.checked)}
            />
            save image thumbnails by default
          </label>
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={draft.headless}
              onChange={(e) => set("headless", e.target.checked)}
            />
            hide the browser window while backing up
            <span className="text-xs text-fg-muted">(only after the device is linked)</span>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-fg">Never back up these chats (one per line)</span>
          <textarea
            value={draft.excluded.join("\n")}
            onChange={(e) =>
              set(
                "excluded",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            rows={4}
            className={`mt-1 ${field} font-mono-tight text-xs`}
          />
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {note && <p className="text-xs text-fg-muted">{note}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { streamJob, toolsApi, type OneDriveStatus } from "@/lib/tools/whatsapp/client";

/**
 * Link the archive to OneDrive so the deployed site can read it from any
 * device. Consent is scoped to this app's own folder, not the whole drive.
 */
export default function OneDrivePanel({ initial }: { initial: OneDriveStatus }) {
  const [status, setStatus] = useState<OneDriveStatus>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setStatus(await toolsApi.oneDriveStatus());
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // The OAuth callback returns here with ?onedrive=linked | failed: ...
  // Read during render rather than in an effect, so no cascading render.
  const [note, setNoteState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const param = new URLSearchParams(window.location.search).get("onedrive");
    return param ? (param === "linked" ? "OneDrive linked." : `OneDrive ${param}`) : null;
  });

  useEffect(() => {
    // tidy the URL only — no state touched here
    if (typeof window !== "undefined" && window.location.search.includes("onedrive=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const link = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await toolsApi.oneDriveLink();
      window.location.href = url; // hand off to Microsoft for consent
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    try {
      await toolsApi.oneDriveUnlink();
      setNoteState("Unlinked. Files already in OneDrive were left alone.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    setBusy(true);
    setError(null);
    setNoteState("Starting sync...");
    try {
      const job = await toolsApi.oneDriveSync();
      streamJob(job.id, (ev) => {
        if (ev.phase === "sync-progress") {
          setNoteState(`Uploading ${ev.uploaded}/${ev.total} - ${String(ev.current ?? "").slice(0, 60)}`);
        } else if (ev.phase === "sync-done") {
          setNoteState(`Sync finished - ${ev.uploaded} uploaded, ${ev.skipped} already current.`);
          setBusy(false);
        } else if (ev.phase === "failed") {
          setError(String(ev.error ?? "Sync failed."));
          setBusy(false);
        }
      });
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-bg-raised p-5">
      <h2 className="text-base font-semibold text-fg">OneDrive</h2>
      <OneDriveBody status={status} busy={busy} onLink={link} onUnlink={unlink} onSync={sync} />
      {note && <p className="mt-3 text-xs text-fg-muted">{note}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  );
}

function OneDriveBody({
  status,
  busy,
  onLink,
  onUnlink,
  onSync,
}: {
  status: OneDriveStatus;
  busy: boolean;
  onLink: () => void;
  onUnlink: () => void;
  onSync: () => void;
}) {
  if (!status.configured) {
    return (
      <>
        <p className="mt-1 text-sm text-fg-muted">
          Link the archive to OneDrive and the deployed site can show your chats on any device. It
          needs an app registration first &mdash; a one-off, five-minute job.
        </p>
        <ol className="mt-3 space-y-1.5 text-xs text-fg-muted">
          <li>
            1. <span className="text-fg">portal.azure.com</span> &rarr; App registrations &rarr; New
            registration. Any name; account type &ldquo;personal Microsoft accounts&rdquo;.
          </li>
          <li>
            2. Add a <span className="text-fg">Web</span> redirect URI:{" "}
            <code className="text-fg">
              http://localhost:3000/api/tools/whatsapp/onedrive/callback
            </code>{" "}
            (add your live domain the same way).
          </li>
          <li>
            3. API permissions &rarr; Microsoft Graph &rarr; Delegated &rarr;{" "}
            <code className="text-fg">Files.ReadWrite.AppFolder</code> and{" "}
            <code className="text-fg">offline_access</code>.
          </li>
          <li>4. Certificates &amp; secrets &rarr; New client secret.</li>
          <li>
            5. Put <code className="text-fg">ONEDRIVE_CLIENT_ID</code> and{" "}
            <code className="text-fg">ONEDRIVE_CLIENT_SECRET</code> in{" "}
            <code className="text-fg">.env.local</code>, then restart.
          </li>
        </ol>
      </>
    );
  }

  if (!status.linked) {
    return (
      <>
        <p className="mt-1 text-sm text-fg-muted">
          Ready to link. Microsoft will ask you to approve access to a single folder this app owns
          &mdash; nothing else in your OneDrive is visible to it.
        </p>
        <button
          onClick={onLink}
          disabled={busy}
          className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Opening Microsoft..." : "Link OneDrive"}
        </button>
      </>
    );
  }

  return (
    <>
      <p className="mt-1 text-sm text-fg-muted">
        Linked{status.account ? ` as ${status.account}` : ""}. Backups mirror here automatically
        when they finish.
      </p>
      <p className="mt-1 font-mono-tight text-[11px] text-fg-muted">
        reading from: {status.source}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onSync}
          disabled={busy}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Sync now
        </button>
        <button
          onClick={onUnlink}
          disabled={busy}
          className="rounded-full border border-line px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent disabled:opacity-50"
        >
          Unlink
        </button>
      </div>
    </>
  );
}

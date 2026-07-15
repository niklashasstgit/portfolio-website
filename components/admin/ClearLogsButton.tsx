"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Permanently deletes all recorded analytics events (recording continues after).
 * Two-step to avoid an accidental wipe: the button asks for confirmation inline.
 */
export default function ClearLogsButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clear-analytics", { method: "POST" });
      if (res.status === 401) throw new Error("Session expired — log in again.");
      if (!res.ok) throw new Error("Failed to clear. Try again.");
      setConfirming(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear.");
    } finally {
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-line px-4 py-1.5 text-sm text-fg-muted transition-colors hover:border-red-500/60 hover:text-red-400"
      >
        Clear all logs
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-400">{error}</span>}
      <span className="text-xs text-fg-muted">Delete all recorded visits?</span>
      <button
        type="button"
        onClick={clear}
        disabled={busy}
        className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Clearing…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="rounded-full px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        Cancel
      </button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** PIN gate for /admin. On success the server sets the session cookie and we
 *  refresh so the admin layout re-checks it and renders the console. */
export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Incorrect PIN.");
      setPin("");
      inputRef.current?.focus();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-bg-raised p-6 shadow-2xl shadow-black/40"
    >
      <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
        Restricted
      </span>
      <h1 className="mt-2 text-lg font-semibold text-fg">Admin access</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {configured
          ? "Enter your admin PIN to continue."
          : "Admin is not configured. Set ADMIN_PIN in the environment, then reload."}
      </p>
      <input
        ref={inputRef}
        type="password"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          if (error) setError(null);
        }}
        autoComplete="off"
        spellCheck={false}
        disabled={!configured}
        aria-label="Admin PIN"
        aria-invalid={!!error}
        className={`mt-4 w-full rounded-lg border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition-colors focus:border-accent disabled:opacity-50 ${
          error ? "border-red-500/70" : "border-line"
        }`}
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy || !configured}
        className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}

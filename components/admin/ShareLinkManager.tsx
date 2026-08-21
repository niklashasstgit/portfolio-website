"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ShareLink } from "@/lib/site-settings";

export type ShareLinkStat = {
  code: string;
  visits: number;
  visitors: number;
  lastSeen: number;
};

function fmtDate(t: number): string {
  return new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Random, URL-safe code. Opaque on purpose — the recipient shouldn't be able to
 *  read the label you filed them under. */
function newCode(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/**
 * Named, trackable share links.
 *
 * Each link is a normal URL with `?via=<code>` appended. When someone opens it,
 * the code is stored in their browser and attached to every page view they make
 * from then on — so the dashboard can tell "the person I sent the Airbus link
 * to" apart from organic traffic, and show what they actually read.
 */
export default function ShareLinkManager({
  initialLinks,
  stats,
  siteUrl,
  targets,
}: {
  initialLinks: ShareLink[];
  stats: Record<string, ShareLinkStat>;
  siteUrl: string;
  targets: { href: string; label: string }[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState<ShareLink[]>(initialLinks);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("/");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(links) !== JSON.stringify(initialLinks),
    [links, initialLinks]
  );

  const urlFor = (l: ShareLink) => `${siteUrl}${l.target}?via=${l.code}`;

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = new Set(links.map((l) => l.code));
    let code = newCode();
    while (existing.has(code)) code = newCode();
    setLinks((prev) => [
      { code, name: trimmed.slice(0, 80), target, createdAt: Date.now() },
      ...prev,
    ]);
    setName("");
  };

  const remove = (code: string) => {
    setLinks((prev) => prev.filter((l) => l.code !== code));
  };

  const rename = (code: string, value: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.code === code ? { ...l, name: value.slice(0, 80) } : l))
    );
  };

  const copy = async (l: ShareLink) => {
    try {
      await navigator.clipboard.writeText(urlFor(l));
      setCopied(l.code);
      setTimeout(() => setCopied((c) => (c === l.code ? null : c)), 1600);
    } catch {
      setError("Couldn't copy — select the URL and copy it manually.");
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareLinks: links }),
      });
      if (!res.ok) throw new Error("save failed");
      router.refresh();
    } catch {
      setError("Save failed. Check you're still signed in and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-bg-raised/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-fg">Tracked share links</h2>
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">
            Give a link a name, send it to someone, and every visit that arrives
            through it is flagged with that name — including the pages they read
            afterwards. The name is never visible to them; the URL only carries a
            random code.
          </p>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {/* create */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[220px]">
          <span className="font-mono-tight block text-[10px] uppercase tracking-widest text-fg-faint">
            Link name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="e.g. Airbus application, Lilium recruiter"
            className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          />
        </label>
        <label className="min-w-[200px]">
          <span className="font-mono-tight block text-[10px] uppercase tracking-widest text-fg-faint">
            Lands on
          </span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
          >
            {targets.map((t) => (
              <option key={t.href} value={t.href}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={add}
          disabled={!name.trim()}
          className="rounded-full border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
        >
          Create link
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {/* list */}
      {links.length === 0 ? (
        <p className="mt-6 text-sm text-fg-faint">
          No share links yet. Create one above, then use it in an application or
          message instead of the plain URL.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="font-mono-tight px-2 py-2 text-[10px] uppercase tracking-widest text-fg-faint">
                  Name
                </th>
                <th className="font-mono-tight px-2 py-2 text-[10px] uppercase tracking-widest text-fg-faint">
                  Link
                </th>
                <th className="font-mono-tight px-2 py-2 text-right text-[10px] uppercase tracking-widest text-fg-faint">
                  Visits
                </th>
                <th className="font-mono-tight px-2 py-2 text-right text-[10px] uppercase tracking-widest text-fg-faint">
                  People
                </th>
                <th className="font-mono-tight px-2 py-2 text-[10px] uppercase tracking-widest text-fg-faint">
                  Last opened
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {links.map((l) => {
                const s = stats[l.code];
                return (
                  <tr key={l.code} className="border-b border-line/60 align-top">
                    <td className="px-2 py-2.5">
                      <input
                        value={l.name}
                        onChange={(e) => rename(l.code, e.target.value)}
                        className="w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-1 text-sm text-fg outline-none hover:border-line focus:border-accent"
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <code className="break-all text-xs text-fg-muted">
                          {urlFor(l)}
                        </code>
                        <button
                          onClick={() => copy(l)}
                          className="font-mono-tight shrink-0 rounded border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-fg-faint transition-colors hover:border-accent hover:text-accent"
                        >
                          {copied === l.code ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-fg">
                      {s?.visits ?? 0}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-fg-muted">
                      {s?.visitors ?? 0}
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-fg-muted">
                      {s?.lastSeen ? fmtDate(s.lastSeen) : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => remove(l.code)}
                        className="font-mono-tight rounded border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-fg-faint transition-colors hover:border-red-500/60 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {links.length > 0 && (
        <p className="mt-4 text-xs text-fg-faint">
          Deleting a link stops it being named in the dashboard, but visits that
          already came through it stay in the log.
        </p>
      )}
    </div>
  );
}

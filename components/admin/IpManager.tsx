"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { IpLabel } from "@/lib/site-settings";

export type IpRow = {
  ip: string;
  visits: number;
  lastSeen: number;
  org: string;
  location: string;
};

type Labels = Record<string, IpLabel>;

function fmtDate(t: number): string {
  return new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Lists every IP that has visited so the admin can give it a friendly name
 * (e.g. "My phone") and/or exclude it from the analytics. Excluded IPs are
 * filtered out of the stats/companies/recent tables on save.
 */
/** IPv4 /24 prefix (first three octets) of an address, or null if not IPv4. */
function slash24(ip: string): string | null {
  const g = ip.split(".");
  if (g.length !== 4 || g.some((o) => !/^\d{1,3}$/.test(o))) return null;
  return `${g[0]}.${g[1]}.${g[2]}`;
}

export default function IpManager({
  rows,
  initialLabels,
  initialPrefixes,
}: {
  rows: IpRow[];
  initialLabels: Labels;
  initialPrefixes: string[];
}) {
  const router = useRouter();
  const [labels, setLabels] = useState<Labels>(initialLabels);
  const [prefixes, setPrefixes] = useState<string[]>(initialPrefixes);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () =>
      JSON.stringify(labels) !== JSON.stringify(initialLabels) ||
      JSON.stringify(prefixes) !== JSON.stringify(initialPrefixes),
    [labels, prefixes, initialLabels, initialPrefixes]
  );

  const addPrefix = (p: string) =>
    setPrefixes((prev) => (prev.includes(p) ? prev : [...prev, p]));
  const removePrefix = (p: string) => setPrefixes((prev) => prev.filter((x) => x !== p));

  const setEntry = (ip: string, patch: Partial<IpLabel>) => {
    setLabels((prev) => {
      const merged: IpLabel = { ...prev[ip], ...patch };
      const clean: IpLabel = {};
      const label = (merged.label ?? "").trim();
      if (label) clean.label = label;
      if (merged.excluded) clean.excluded = true;
      const next = { ...prev };
      if (clean.label !== undefined || clean.excluded) next[ip] = clean;
      else delete next[ip];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipLabels: labels, excludedPrefixes: prefixes }),
      });
      if (res.status === 401) throw new Error("Session expired — log in again.");
      if (!res.ok) throw new Error("Save failed. Try again.");
      const data = (await res.json()) as { ipLabels: Labels; excludedPrefixes: string[] };
      setLabels(data.ipLabels ?? {});
      setPrefixes(data.excludedPrefixes ?? []);
      setSavedTick((t) => t + 1);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-fg">Visitors by IP</h2>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {savedTick > 0 && !dirty && !error && (
            <span className="text-xs text-accent">Saved ✓</span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save labels"}
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-fg-muted">
        Name an IP and switch “Exclude” to drop it from the stats above. Since a
        home IP rotates, use <span className="text-fg">/24</span> to exclude its
        whole block. (For your own devices, the Devices panel above is more
        reliable — it survives IP changes.)
      </p>

      {prefixes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
            Excluded prefixes
          </span>
          {prefixes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => removePrefix(p)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono-tight text-xs text-accent transition-colors hover:border-red-500/60 hover:text-red-400"
              title="Remove prefix"
            >
              {p}.* <span className="text-accent/60 group-hover:text-red-400">✕</span>
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">No IPs recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-bg-raised/50 text-fg-muted">
              <tr className="font-mono-tight text-[10px] uppercase tracking-widest">
                <th className="px-4 py-2.5 font-medium">IP</th>
                <th className="px-4 py-2.5 font-medium">Network</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 text-right font-medium">Visits</th>
                <th className="px-4 py-2.5 font-medium">Label</th>
                <th className="px-4 py-2.5 text-center font-medium">Exclude</th>
                <th className="px-4 py-2.5 text-center font-medium">Block</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const entry = labels[r.ip] ?? {};
                const excluded = entry.excluded === true;
                return (
                  <tr
                    key={r.ip}
                    className={`border-b border-line/60 last:border-b-0 ${
                      excluded ? "opacity-45" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono-tight text-xs text-fg">{r.ip}</td>
                    <td className="px-4 py-3 text-fg-muted">{r.org || "—"}</td>
                    <td className="px-4 py-3 text-fg-muted">{r.location || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-muted">
                      {r.visits}
                      <span className="ml-2 text-[10px] text-fg-faint">
                        {fmtDate(r.lastSeen)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={entry.label ?? ""}
                        placeholder="e.g. My phone"
                        onChange={(e) => setEntry(r.ip, { label: e.target.value })}
                        className="w-36 rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={excluded}
                        aria-label={`${excluded ? "Include" : "Exclude"} ${r.ip}`}
                        onClick={() => setEntry(r.ip, { excluded: !excluded })}
                        className={`relative inline-block h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                          excluded ? "bg-accent" : "bg-line-strong"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform ${
                            excluded ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {slash24(r.ip) &&
                        (prefixes.includes(slash24(r.ip)!) ? (
                          <span className="font-mono-tight text-[10px] text-accent">/24 ✓</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addPrefix(slash24(r.ip)!)}
                            className="font-mono-tight rounded border border-line px-2 py-1 text-[10px] text-fg-muted transition-colors hover:border-accent hover:text-accent"
                            title={`Exclude ${slash24(r.ip)}.* (the whole /24 block)`}
                          >
                            Exclude /24
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

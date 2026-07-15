"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { IpLabel } from "@/lib/site-settings";
import VisitDetail from "./VisitDetail";

export type DeviceRow = {
  vid: string;
  visits: number;
  lastSeen: number;
  lastIp: string;
  network: string;
  location: string;
  browser: string;
  os: string;
  deviceType: string;
  screen: string;
  viewport: string;
  language: string;
  timezone: string;
  ua: string;
  asn: string;
  ref: string;
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
 * Distinct devices, identified by a persistent per-browser id (cookie/localStorage
 * set by components/Analytics.tsx). Because the id survives IP changes and is
 * unique per browser, labeling/excluding a device here reliably hides your own
 * phone/laptop from the analytics even as their IPs change or they share one WiFi.
 */
export default function DeviceManager({
  rows,
  initialLabels,
}: {
  rows: DeviceRow[];
  initialLabels: Labels;
}) {
  const router = useRouter();
  const [labels, setLabels] = useState<Labels>(initialLabels);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(labels) !== JSON.stringify(initialLabels),
    [labels, initialLabels]
  );

  const setEntry = (vid: string, patch: Partial<IpLabel>) => {
    setLabels((prev) => {
      const merged: IpLabel = { ...prev[vid], ...patch };
      const clean: IpLabel = {};
      const label = (merged.label ?? "").trim();
      if (label) clean.label = label;
      if (merged.excluded) clean.excluded = true;
      const next = { ...prev };
      if (clean.label !== undefined || clean.excluded) next[vid] = clean;
      else delete next[vid];
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
        body: JSON.stringify({ deviceLabels: labels }),
      });
      if (res.status === 401) throw new Error("Session expired — log in again.");
      if (!res.ok) throw new Error("Save failed. Try again.");
      const data = (await res.json()) as { deviceLabels: Labels };
      setLabels(data.deviceLabels ?? {});
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
        <h2 className="text-lg font-semibold text-fg">Devices</h2>
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
            {saving ? "Saving…" : "Save devices"}
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-fg-muted">
        Each browser gets a stable id, so this is the reliable way to exclude your
        own devices — it keeps working when the IP changes (mobile↔WiFi, daily ISP
        rotation) and tells apart a phone &amp; laptop on the same WiFi. Name a
        device, then switch “Exclude” to hide it from the stats above. Visit this
        site once from a device for it to appear here.
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">
          No devices recorded yet. (Older visits from before device ids were added
          won’t appear — reload the public site once to register this browser.)
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-bg-raised/50 text-fg-muted">
              <tr className="font-mono-tight text-[10px] uppercase tracking-widest">
                <th className="px-4 py-2.5 font-medium">Device</th>
                <th className="px-4 py-2.5 font-medium">Browser / OS</th>
                <th className="px-4 py-2.5 font-medium">Last network</th>
                <th className="px-4 py-2.5 font-medium">Last IP</th>
                <th className="px-4 py-2.5 text-right font-medium">Visits</th>
                <th className="px-4 py-2.5 text-center font-medium">Exclude</th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const entry = labels[r.vid] ?? {};
                const excluded = entry.excluded === true;
                return (
                  <tr
                    key={r.vid}
                    className={`border-b border-line/60 last:border-b-0 ${
                      excluded ? "opacity-45" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={entry.label ?? ""}
                        placeholder="e.g. My phone"
                        onChange={(e) => setEntry(r.vid, { label: e.target.value })}
                        className="w-40 rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
                      />
                      <div className="mt-1 font-mono-tight text-[10px] text-fg-faint">
                        {r.vid.slice(0, 8)}… · last seen {fmtDate(r.lastSeen)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {[r.browser, r.os].filter(Boolean).join(" · ") || "—"}
                      {r.deviceType && (
                        <span className="block text-xs capitalize text-fg-faint">
                          {r.deviceType}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {r.network || "—"}
                      {r.location && (
                        <span className="block text-xs text-fg-faint">{r.location}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono-tight text-xs text-fg-muted">
                      {r.lastIp || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-muted">
                      {r.visits}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={excluded}
                        aria-label={`${excluded ? "Include" : "Exclude"} device ${r.vid}`}
                        onClick={() => setEntry(r.vid, { excluded: !excluded })}
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
                    <td className="px-4 py-3 align-top">
                      <VisitDetail
                        details={{
                          browser: r.browser,
                          os: r.os,
                          deviceType: r.deviceType,
                          screen: r.screen,
                          viewport: r.viewport,
                          language: r.language,
                          timezone: r.timezone,
                          ua: r.ua,
                          asn: r.asn,
                          ref: r.ref,
                        }}
                      />
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

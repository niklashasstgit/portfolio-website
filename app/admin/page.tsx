import { readEvents, type AnalyticsEvent } from "@/lib/analytics-store";
import { activeProvider } from "@/lib/ip-intel";
import { readSettings } from "@/lib/site-settings-store";
import { isPrefixExcluded } from "@/lib/site-settings";
import IpManager, { type IpRow } from "@/components/admin/IpManager";
import DeviceManager, { type DeviceRow } from "@/components/admin/DeviceManager";

export const dynamic = "force-dynamic";

type CompanyRow = {
  company: string;
  visits: number;
  days: number;
  firstSeen: number;
  lastSeen: number;
  location: string;
};

function locationOf(e: AnalyticsEvent): string {
  return [e.city, e.country].filter(Boolean).join(", ");
}

function fmtDate(t: number): string {
  return new Date(t).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(t: number): string {
  return new Date(t).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function aggregateCompanies(events: AnalyticsEvent[]): CompanyRow[] {
  const map = new Map<string, { row: CompanyRow; dayset: Set<string> }>();
  for (const e of events) {
    if (!e.company) continue;
    const key = e.company;
    const day = new Date(e.t).toDateString();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        row: {
          company: key,
          visits: 1,
          days: 1,
          firstSeen: e.t,
          lastSeen: e.t,
          location: locationOf(e),
        },
        dayset: new Set([day]),
      });
    } else {
      existing.row.visits += 1;
      existing.dayset.add(day);
      existing.row.days = existing.dayset.size;
      if (e.t < existing.row.firstSeen) existing.row.firstSeen = e.t;
      if (e.t > existing.row.lastSeen) {
        existing.row.lastSeen = e.t;
        if (locationOf(e)) existing.row.location = locationOf(e);
      }
    }
  }
  return [...map.values()].map((v) => v.row).sort((a, b) => b.visits - a.visits);
}

/** Distinct IPs seen, newest-visit metadata + visit count, for the IP manager. */
function aggregateIps(events: AnalyticsEvent[]): IpRow[] {
  const map = new Map<string, IpRow>();
  for (const e of events) {
    const existing = map.get(e.ip);
    if (!existing) {
      map.set(e.ip, {
        ip: e.ip,
        visits: 1,
        lastSeen: e.t,
        org: e.company || e.org,
        location: locationOf(e),
      });
    } else {
      existing.visits += 1;
      if (e.t > existing.lastSeen) {
        existing.lastSeen = e.t;
        if (e.company || e.org) existing.org = e.company || e.org;
        if (locationOf(e)) existing.location = locationOf(e);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits);
}

/** Distinct devices (by persistent id), for the device manager. */
function aggregateDevices(events: AnalyticsEvent[]): DeviceRow[] {
  const map = new Map<string, DeviceRow>();
  for (const e of events) {
    if (!e.vid) continue; // pre-cookie or bot events have no device id
    const existing = map.get(e.vid);
    if (!existing) {
      map.set(e.vid, {
        vid: e.vid,
        visits: 1,
        lastSeen: e.t,
        lastIp: e.ip,
        network: e.company || e.org,
        location: locationOf(e),
      });
    } else {
      existing.visits += 1;
      if (e.t > existing.lastSeen) {
        existing.lastSeen = e.t;
        existing.lastIp = e.ip;
        if (e.company || e.org) existing.network = e.company || e.org;
        if (locationOf(e)) existing.location = locationOf(e);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.visits - a.visits);
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-bg-raised/50 px-4 py-3">
      <div className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [allEvents, settings] = await Promise.all([readEvents(), readSettings()]);
  const ipLabels = settings.ipLabels ?? {};
  const deviceLabels = settings.deviceLabels ?? {};
  const excludedPrefixes = settings.excludedPrefixes ?? [];
  // A visit's display name: its device label first, then its IP label.
  const labelOf = (e: AnalyticsEvent) => deviceLabels[e.vid]?.label ?? ipLabels[e.ip]?.label;

  // An event is hidden from the stats/tables if its device, its exact IP, or its
  // IP prefix is excluded. The managers below still list everything so any of
  // these can be toggled back on.
  const isExcluded = (e: AnalyticsEvent) =>
    deviceLabels[e.vid]?.excluded === true ||
    ipLabels[e.ip]?.excluded === true ||
    isPrefixExcluded(e.ip, excludedPrefixes);
  const events = allEvents.filter((e) => !isExcluded(e));

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  const companies = aggregateCompanies(events);
  const uniqueIps = new Set(events.map((e) => e.ip)).size;
  const viewsToday = events.filter((e) => e.t >= todayMs).length;
  const recent = [...events].sort((a, b) => b.t - a.t).slice(0, 60);
  const ipRows = aggregateIps(allEvents);
  const deviceRows = aggregateDevices(allEvents);

  return (
    <div className="space-y-10">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total views" value={events.length} />
        <StatTile label="Unique IPs" value={uniqueIps} />
        <StatTile label="Companies" value={companies.length} />
        <StatTile label="Views today" value={viewsToday} />
      </div>

      <p className="text-xs text-fg-faint">
        “Company” is the network owner (ASN organization) of the visitor’s IP —
        which identifies corporate visitors, but shows only the ISP for
        home/mobile connections (those aren’t attributed). Enrichment provider:{" "}
        <span className="text-fg-muted">{activeProvider()}</span>. Storing visitor
        IPs + locations is personal data under GDPR.
      </p>

      {/* Companies table */}
      <section>
        <h2 className="text-lg font-semibold text-fg">Companies that visited</h2>
        {companies.length === 0 ? (
          <p className="mt-3 text-sm text-fg-muted">
            No company-attributed visits yet. (Local visits from 127.0.0.1 can’t
            be geolocated — deploy, or the pipeline is verified with a test IP.)
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-bg-raised/50 text-fg-muted">
                <tr className="font-mono-tight text-[10px] uppercase tracking-widest">
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 text-right font-medium">Visits</th>
                  <th className="px-4 py-2.5 text-right font-medium">Days</th>
                  <th className="px-4 py-2.5 font-medium">First seen</th>
                  <th className="px-4 py-2.5 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.company} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-fg">{c.company}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{c.location || "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg">{c.visits}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg-muted">{c.days}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{fmtDay(c.firstSeen)}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{fmtDate(c.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent visits */}
      <section>
        <h2 className="text-lg font-semibold text-fg">Recent visits</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-fg-muted">No visits recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-bg-raised/50 text-fg-muted">
                <tr className="font-mono-tight text-[10px] uppercase tracking-widest">
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium">Company / Network</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 font-medium">Page</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e, i) => (
                  <tr key={`${e.t}-${i}`} className="border-b border-line/60 last:border-b-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-fg-muted">{fmtDate(e.t)}</td>
                    <td className="px-4 py-2.5">
                      {labelOf(e) ? (
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
                          {labelOf(e)}
                        </span>
                      ) : (
                        <span className={e.company ? "text-fg" : "text-fg-faint"}>
                          {e.company || e.org || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-fg-muted">{locationOf(e) || "—"}</td>
                    <td className="px-4 py-2.5 font-mono-tight text-xs text-fg-muted">{e.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Device labels + exclusion (survives IP changes / mobile↔WiFi) */}
      <section>
        <DeviceManager rows={deviceRows} initialLabels={deviceLabels} />
      </section>

      {/* IP + prefix labels + exclusion */}
      <section>
        <IpManager
          rows={ipRows}
          initialLabels={ipLabels}
          initialPrefixes={excludedPrefixes}
        />
      </section>
    </div>
  );
}

import { readEvents, type AnalyticsEvent } from "@/lib/analytics-store";
import { activeProvider } from "@/lib/ip-intel";

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
  const events = await readEvents();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  const companies = aggregateCompanies(events);
  const uniqueIps = new Set(events.map((e) => e.ip)).size;
  const viewsToday = events.filter((e) => e.t >= todayMs).length;
  const recent = [...events].sort((a, b) => b.t - a.t).slice(0, 60);

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
                      <span className={e.company ? "text-fg" : "text-fg-faint"}>
                        {e.company || e.org || "—"}
                      </span>
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
    </div>
  );
}

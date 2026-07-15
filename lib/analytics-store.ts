// NOTE: server-only module (uses node:fs + fetch to KV). Imported from the
// /api/track route handler and the /admin dashboard (both server-side).
//
// Persists visitor events + a per-IP enrichment cache, using the same dual
// backend as lib/site-settings-store.ts:
//   - Upstash Redis (KV) when its env vars are present — the only option that
//     survives across serverless instances in production.
//   - Local JSON files under .data/ (gitignored) otherwise, so dev works with
//     zero external services.
//
// PRIVACY: events include the visitor's IP address and derived location/employer.
// Under GDPR an IP is personal data — retention/compliance is the site owner's
// responsibility (see the admin dashboard note).
import { promises as fs } from "fs";
import path from "path";
import type { IpInfo } from "./ip-intel";

export type AnalyticsEvent = {
  /** epoch ms */
  t: number;
  path: string;
  ref: string;
  /** persistent per-browser device id (from a first-party cookie/localStorage). */
  vid: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
  asn: string;
  /** attributed company, or null for residential/mobile/hosting IPs */
  company: string | null;
  ua: string;
  /** Parsed from UA server-side: "Chrome", "Safari", "Firefox", ... */
  browser: string;
  /** Parsed from UA server-side: "Windows", "macOS", "iOS", "Android", "Linux", ... */
  os: string;
  /** Parsed from UA server-side. */
  deviceType: "mobile" | "tablet" | "desktop";
  /** Client-reported, all optional (best-effort, never blocks the beacon). */
  screen: string; // e.g. "1920x1080"
  viewport: string; // e.g. "1280x800"
  language: string; // e.g. "de-DE"
  timezone: string; // e.g. "Europe/Berlin"
};

const EVENTS_KEY = "analytics:events";
const EVENTS_CAP = 5000;
const IPMETA_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const EVENTS_FILE = path.join(process.cwd(), ".data", "analytics.json");
const IPMETA_FILE = path.join(process.cwd(), ".data", "ip-cache.json");

function kvEnv(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const env = kvEnv();
  if (!env) throw new Error("KV env not configured");
  const res = await fetch(env.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV command failed: ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(`KV error: ${data.error}`);
  return data.result ?? null;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export async function recordEvent(evt: AnalyticsEvent): Promise<void> {
  if (kvEnv()) {
    await kvCommand(["LPUSH", EVENTS_KEY, JSON.stringify(evt)]);
    await kvCommand(["LTRIM", EVENTS_KEY, 0, EVENTS_CAP - 1]);
    return;
  }
  const list = await readFileEvents();
  list.unshift(evt);
  await writeJson(EVENTS_FILE, list.slice(0, EVENTS_CAP));
}

export async function readEvents(): Promise<AnalyticsEvent[]> {
  if (kvEnv()) {
    const result = await kvCommand(["LRANGE", EVENTS_KEY, 0, EVENTS_CAP - 1]);
    if (!Array.isArray(result)) return [];
    return result
      .map((s) => {
        try {
          return JSON.parse(String(s)) as AnalyticsEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is AnalyticsEvent => e !== null);
  }
  return readFileEvents();
}

/** Delete every recorded event (the IP-enrichment cache is left intact). */
export async function clearEvents(): Promise<void> {
  if (kvEnv()) {
    await kvCommand(["DEL", EVENTS_KEY]);
    return;
  }
  try {
    await fs.rm(EVENTS_FILE, { force: true });
  } catch {
    /* already gone */
  }
}

async function readFileEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Per-IP enrichment cache (avoid re-hitting the rate-limited IP API)  */
/* ------------------------------------------------------------------ */

export async function getCachedIpInfo(ip: string): Promise<IpInfo | null> {
  if (kvEnv()) {
    const result = await kvCommand(["GET", `ipmeta:${ip}`]);
    if (typeof result !== "string") return null;
    try {
      return JSON.parse(result) as IpInfo;
    } catch {
      return null;
    }
  }
  try {
    const raw = await fs.readFile(IPMETA_FILE, "utf8");
    const map = JSON.parse(raw) as Record<string, { info: IpInfo; exp: number }>;
    const entry = map[ip];
    if (!entry || entry.exp < Date.now()) return null;
    return entry.info;
  } catch {
    return null;
  }
}

export async function setCachedIpInfo(ip: string, info: IpInfo): Promise<void> {
  if (kvEnv()) {
    await kvCommand(["SET", `ipmeta:${ip}`, JSON.stringify(info), "EX", IPMETA_TTL_SECONDS]);
    return;
  }
  let map: Record<string, { info: IpInfo; exp: number }> = {};
  try {
    map = JSON.parse(await fs.readFile(IPMETA_FILE, "utf8"));
  } catch {
    /* start fresh */
  }
  map[ip] = { info, exp: Date.now() + IPMETA_TTL_SECONDS * 1000 };
  await writeJson(IPMETA_FILE, map);
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data), "utf8");
}

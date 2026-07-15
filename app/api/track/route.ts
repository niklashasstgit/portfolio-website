import { headers } from "next/headers";
import { companyFrom, lookupIp, type IpInfo } from "@/lib/ip-intel";
import { parseUserAgent } from "@/lib/ua-parse";
import {
  getCachedIpInfo,
  recordEvent,
  setCachedIpInfo,
  type AnalyticsEvent,
} from "@/lib/analytics-store";

/** Whitelisted "WxH" shape — never trust raw client strings past this. */
function dims(input: unknown): string {
  if (typeof input !== "string") return "";
  return /^\d{1,5}x\d{1,5}$/.test(input) ? input : "";
}
function shortText(input: unknown, max: number): string {
  return typeof input === "string" ? input.slice(0, max) : "";
}

// Runs on every public page view via the client beacon (components/Analytics.tsx).
// Node runtime so we can use the file-backed store in local dev.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extract the real client IP from the proxy headers Vercel/hosts set. */
function clientIp(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "";
}

// Obvious crawlers/bots — we only care about human (esp. corporate) visitors.
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|monitor|pingdom|uptime|curl|wget|python-requests|axios|node-fetch/i;

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ua = h.get("user-agent") ?? "";
    if (BOT_RE.test(ua)) return new Response(null, { status: 204 });

    let body: {
      path?: unknown;
      ref?: unknown;
      vid?: unknown;
      screen?: unknown;
      viewport?: unknown;
      language?: unknown;
      timezone?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      body = {};
    }

    const rawPath = typeof body.path === "string" ? body.path : "/";
    const path = rawPath.slice(0, 300);
    // Don't record hits on the admin console itself.
    if (path.startsWith("/admin")) return new Response(null, { status: 204 });
    const ref = (typeof body.ref === "string" ? body.ref : "").slice(0, 300);
    const vid = (typeof body.vid === "string" ? body.vid : "").slice(0, 64);
    const { browser, os, deviceType } = parseUserAgent(ua);

    const ip = clientIp(h);

    // Enrich (cached per-IP to stay within the IP API's rate limits).
    let info: IpInfo | null = ip ? await getCachedIpInfo(ip) : null;
    if (!info && ip) {
      info = await lookupIp(ip);
      // Only cache real lookups (skip empty/private so we retry if config changes).
      if (info.country || info.org) await setCachedIpInfo(ip, info);
    }

    const evt: AnalyticsEvent = {
      t: Date.now(),
      path,
      ref,
      vid,
      ip: ip || "unknown",
      city: info?.city ?? "",
      region: info?.region ?? "",
      country: info?.country ?? "",
      countryCode: info?.countryCode ?? "",
      org: info?.org ?? "",
      asn: info?.asn ?? "",
      company: info ? companyFrom(info) : null,
      ua: ua.slice(0, 300),
      browser,
      os,
      deviceType,
      screen: dims(body.screen),
      viewport: dims(body.viewport),
      language: shortText(body.language, 20),
      timezone: shortText(body.timezone, 60),
    };

    await recordEvent(evt);
  } catch {
    // Never surface tracking failures to the visitor.
  }
  return new Response(null, { status: 204 });
}

/**
 * IP intelligence — turns a raw visitor IP into a location + network owner.
 *
 * This is the mechanism behind "which company visited my site": for corporate
 * visitors the IP's network-owner (ASN organization) *is* the employer (e.g.
 * "Airbus Defence and Space"); for home/mobile visitors it's only their ISP.
 * Products like Leadfeeder/Albacross wrap this same signal with proprietary
 * data — we use a public IP API instead.
 *
 * Swappable provider, chosen at runtime:
 *   - IPinfo.io when `IPINFO_TOKEN` is set (HTTPS, cleaner data, 50k/mo free).
 *   - ip-api.com otherwise (no signup, ~45 req/min, HTTP only on the free tier).
 *
 * Server-only in practice (used from the /api/track route).
 */

export type IpInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  /** Network-owner / organization name (the company candidate). */
  org: string;
  /** ASN string, e.g. "AS15169". */
  asn: string;
  isHosting: boolean;
  isMobile: boolean;
  isProxy: boolean;
};

export type Provider = "ipinfo" | "ip-api";

export function activeProvider(): Provider {
  return process.env.IPINFO_TOKEN ? "ipinfo" : "ip-api";
}

/** Localhost / private / reserved ranges we shouldn't (and can't) geolocate. */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip.startsWith("::ffff:127.") || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.") || ip.startsWith("fe80:")) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  // Unique local IPv6 fc00::/7
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  return false;
}

const EMPTY = (ip: string): IpInfo => ({
  ip,
  city: "",
  region: "",
  country: "",
  countryCode: "",
  org: "",
  asn: "",
  isHosting: false,
  isMobile: false,
  isProxy: false,
});

/** "AS15169 Google LLC" → { asn: "AS15169", name: "Google LLC" }. */
function splitAsnOrg(raw: string): { asn: string; name: string } {
  const s = (raw || "").trim();
  const m = s.match(/^(AS\d+)\s+(.*)$/i);
  if (m) return { asn: m[1].toUpperCase(), name: m[2].trim() };
  return { asn: "", name: s };
}

async function lookupIpApi(ip: string): Promise<IpInfo> {
  const fields =
    "status,country,countryCode,regionName,city,isp,org,as,asname,mobile,proxy,hosting,query";
  const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`ip-api ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  if (d.status !== "success") throw new Error(`ip-api: ${String(d.message ?? "failed")}`);
  const { asn } = splitAsnOrg(String(d.as ?? ""));
  const org = String(d.org || d.asname || d.isp || "");
  return {
    ip: String(d.query ?? ip),
    city: String(d.city ?? ""),
    region: String(d.regionName ?? ""),
    country: String(d.country ?? ""),
    countryCode: String(d.countryCode ?? ""),
    org,
    asn,
    isHosting: Boolean(d.hosting),
    isMobile: Boolean(d.mobile),
    isProxy: Boolean(d.proxy),
  };
}

async function lookupIpinfo(ip: string): Promise<IpInfo> {
  const token = process.env.IPINFO_TOKEN!;
  const res = await fetch(
    `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`,
    { cache: "no-store", signal: AbortSignal.timeout(2500) }
  );
  if (!res.ok) throw new Error(`ipinfo ${res.status}`);
  const d = (await res.json()) as Record<string, unknown>;
  const { asn, name } = splitAsnOrg(String(d.org ?? ""));
  return {
    ip: String(d.ip ?? ip),
    city: String(d.city ?? ""),
    region: String(d.region ?? ""),
    country: String(d.country ?? ""), // ipinfo returns a 2-letter code here
    countryCode: String(d.country ?? ""),
    org: name,
    asn,
    isHosting: false, // not available on the free tier
    isMobile: false,
    isProxy: false,
  };
}

/** Geolocate + identify the network owner of an IP. Returns empty info on failure. */
export async function lookupIp(ip: string): Promise<IpInfo> {
  if (isPrivateIp(ip)) return EMPTY(ip);
  try {
    return process.env.IPINFO_TOKEN ? await lookupIpinfo(ip) : await lookupIpApi(ip);
  } catch {
    return EMPTY(ip);
  }
}

// Consumer ISPs / telcos: an IP owned by one of these is a residential/mobile
// visitor, not a "company visit", so it isn't attributed in the company table.
const CONSUMER_NET_RE =
  /\b(telekom|vodafone|telefonica|o2|orange|comcast|verizon|at&t|at t|t-mobile|tmobile|sky|virgin media|bt\b|deutsche telekom|kabel|unitymedia|1&1|1and1|swisscom|sunrise|salt|free sas|bouygues|liberty global|charter|cox|spectrum|centurylink|telia|telenor|proximus|kpn|ziggo|movistar|jazztel|tim\b|wind\b|three\b|ee limited|plusnet|talktalk|mobile|broadband|internet services|telecom|telecommunications)\b/i;

/**
 * The company to attribute a visit to — the org name, unless the IP looks
 * residential / mobile / hosting / proxy, in which case we don't attribute it
 * (still stored as a visit, just not as a company).
 */
export function companyFrom(info: IpInfo): string | null {
  const org = info.org.trim();
  if (!org) return null;
  if (info.isMobile || info.isHosting || info.isProxy) return null;
  if (CONSUMER_NET_RE.test(org)) return null;
  return org;
}

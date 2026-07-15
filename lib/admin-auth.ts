/**
 * Admin-area authentication.
 *
 * The `/admin` console (project visibility/relabeling + the visitor-intel
 * dashboard) is gated by a single PIN kept in the `ADMIN_PIN` env var — never
 * shipped to the client. On login the server verifies the PIN and issues a
 * *self-verifying* session cookie: `"<issuedAtMs>.<hex-hmac>"`, where the HMAC is
 * over the timestamp keyed by a server secret. No session store is needed — any
 * later request just recomputes the HMAC and checks the age.
 *
 * Isomorphic (Web Crypto only), but in practice only imported from server code
 * (route handlers + the admin layout) since it reads `process.env`.
 */

export const ADMIN_COOKIE = "nb_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_AGE_MS = MAX_AGE_SECONDS * 1000;

export { MAX_AGE_SECONDS as ADMIN_COOKIE_MAX_AGE };

/** The PIN required to log in. Empty when unset — in which case login is impossible. */
function adminPin(): string {
  return process.env.ADMIN_PIN ?? "";
}

/** Secret used to sign session cookies. Falls back to the PIN itself. */
function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || adminPin();
}

/** True when admin login is even possible (i.e. an ADMIN_PIN is configured). */
export function isAdminConfigured(): boolean {
  return adminPin().length > 0;
}

/** Constant-time-ish string comparison to avoid trivial timing oracles. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifyAdminPin(pin: unknown): boolean {
  if (typeof pin !== "string" || !pin) return false;
  const expected = adminPin();
  if (!expected) return false; // not configured → nobody gets in
  return safeEqual(pin, expected);
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Mint a fresh signed session token for the `nb_admin` cookie. */
export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmacHex(sessionSecret(), issuedAt);
  return `${issuedAt}.${sig}`;
}

/**
 * Validate a session token: correct signature (so it can't be forged without the
 * secret) and not older than MAX_AGE. Returns false for anything malformed.
 */
export async function verifySessionToken(token: unknown): Promise<boolean> {
  if (typeof token !== "string" || !token.includes(".")) return false;
  if (!isAdminConfigured()) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  if (Date.now() - issued > MAX_AGE_MS) return false;

  const expected = await hmacHex(sessionSecret(), issuedAt);
  return safeEqual(sig, expected);
}

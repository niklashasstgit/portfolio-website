// NOTE: server-only module.
import { promises as fs } from "fs";
import path from "path";

/**
 * OneDrive linking via the Microsoft identity platform.
 *
 * Scope is deliberately `Files.ReadWrite.AppFolder`, not `Files.ReadWrite`:
 * that grants access to one folder Microsoft creates for this app
 * (`Apps/<app name>`) and to nothing else in the drive. If this site is ever
 * compromised, the blast radius is that folder.
 *
 * Refresh tokens rotate on every use, so they must be written back somewhere
 * durable. Same two backends the site already uses for settings: Upstash KV
 * when its env vars exist (the only thing that survives on a serverless host),
 * a gitignored local file otherwise.
 */

const AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
export const SCOPES = ["offline_access", "openid", "Files.ReadWrite.AppFolder"];

const TOKEN_FILE = path.join(process.cwd(), ".data", "onedrive-token.json");
const KV_KEY = "whatsapp:onedrive:token";

export interface StoredToken {
  refreshToken: string;
  accessToken: string;
  /** epoch ms */
  expiresAt: number;
  account?: string;
  linkedAt: string;
}

export function oneDriveConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.ONEDRIVE_CLIENT_ID ?? "";
  const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET ?? "";
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function isOneDriveConfigured(): boolean {
  return !!oneDriveConfig();
}

/* ------------------------------------------------------------ token store */

function kvEnv(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const env = kvEnv();
  if (!env) throw new Error("KV not configured");
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

export async function readToken(): Promise<StoredToken | null> {
  if (kvEnv()) {
    try {
      const raw = await kvCommand(["GET", KV_KEY]);
      return typeof raw === "string" ? (JSON.parse(raw) as StoredToken) : null;
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(await fs.readFile(TOKEN_FILE, "utf8")) as StoredToken;
  } catch {
    return null;
  }
}

export async function writeToken(token: StoredToken): Promise<void> {
  if (kvEnv()) {
    await kvCommand(["SET", KV_KEY, JSON.stringify(token)]);
    return;
  }
  await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  await fs.writeFile(TOKEN_FILE, JSON.stringify(token, null, 2), "utf8");
}

export async function clearToken(): Promise<void> {
  if (kvEnv()) {
    await kvCommand(["DEL", KV_KEY]).catch(() => null);
    return;
  }
  await fs.rm(TOKEN_FILE, { force: true }).catch(() => {});
}

/* ------------------------------------------------------------- oauth flow */

export function authorizeUrl(redirectUri: string, state: string): string {
  const cfg = oneDriveConfig();
  if (!cfg) throw new Error("OneDrive is not configured");
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: SCOPES.join(" "),
    state,
  });
  return `${AUTHORITY}/authorize?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${AUTHORITY}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error_description ?? data.error ?? `token request failed: ${res.status}`);
  }
  return data;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<StoredToken> {
  const cfg = oneDriveConfig();
  if (!cfg) throw new Error("OneDrive is not configured");
  const data = await tokenRequest({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
  });
  const token: StoredToken = {
    refreshToken: data.refresh_token ?? "",
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    linkedAt: new Date().toISOString(),
  };
  await writeToken(token);
  return token;
}

/**
 * A valid access token, refreshing when needed. The rotated refresh token is
 * written straight back — miss that and linking silently dies after an hour.
 */
export async function getAccessToken(): Promise<string> {
  const cfg = oneDriveConfig();
  if (!cfg) throw new Error("OneDrive is not configured");
  const stored = await readToken();
  if (!stored) throw new Error("OneDrive is not linked yet");
  if (stored.accessToken && stored.expiresAt > Date.now()) return stored.accessToken;

  const data = await tokenRequest({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "refresh_token",
    refresh_token: stored.refreshToken,
    scope: SCOPES.join(" "),
  });
  const next: StoredToken = {
    refreshToken: data.refresh_token ?? stored.refreshToken,
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    account: stored.account,
    linkedAt: stored.linkedAt,
  };
  await writeToken(next);
  return next.accessToken;
}

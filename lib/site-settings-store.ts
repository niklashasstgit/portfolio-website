// NOTE: server-only module. Imported exclusively from Server Components / Route
// Handlers (uses next/cache + node:fs). The `server-only` guard package isn't
// installed in this project, so we rely on convention rather than importing it.
import { unstable_cache, revalidateTag } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_SETTINGS,
  mergeSettings,
  type SiteSettings,
} from "./site-settings";

/**
 * Server-side persistence for the site settings document.
 *
 * Two interchangeable backends, picked at runtime:
 *  - **Upstash Redis REST** when its env vars are present (this is what Vercel injects
 *    when you connect an Upstash/KV store). Works on serverless — the only option that
 *    survives across requests/instances in production.
 *  - **Local JSON file** (`.data/site-settings.json`, gitignored) otherwise, so
 *    `npm run dev` works out of the box with zero external services.
 *
 * Reads are wrapped in `unstable_cache` with a tag, so pages that read settings stay
 * static/ISR and are only re-rendered when a save calls `revalidateTag`.
 */

const KEY = "site:settings";
export const SETTINGS_TAG = "site-settings";
const FILE_PATH = path.join(process.cwd(), ".data", "site-settings.json");

function kvEnv(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** Send a single Redis command to the Upstash REST endpoint. */
async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const env = kvEnv();
  if (!env) throw new Error("KV env not configured");
  const res = await fetch(env.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV command failed: ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(`KV error: ${data.error}`);
  return data.result ?? null;
}

/** Read the raw stored patch (partial settings) from whichever backend is active. */
async function readRaw(): Promise<Partial<SiteSettings> | null> {
  if (kvEnv()) {
    const result = await kvCommand(["GET", KEY]);
    if (typeof result !== "string") return null;
    try {
      return JSON.parse(result) as Partial<SiteSettings>;
    } catch {
      return null;
    }
  }
  // file fallback
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as Partial<SiteSettings>;
  } catch {
    return null; // missing / unreadable → defaults
  }
}

async function writeRaw(settings: SiteSettings): Promise<void> {
  const json = JSON.stringify(settings);
  if (kvEnv()) {
    await kvCommand(["SET", KEY, json]);
    return;
  }
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, json, "utf8");
}

/**
 * Cached read of the fully-merged, safe settings. Tagged so it's cheap on every page
 * and revalidates on save. `revalidate: 30` is a safety net in case a tag revalidation
 * is ever missed (e.g. a write from an external tool).
 */
const readMerged = unstable_cache(
  async (): Promise<SiteSettings> => {
    const raw = await readRaw();
    return mergeSettings(DEFAULT_SETTINGS, raw);
  },
  ["site-settings-doc"],
  { tags: [SETTINGS_TAG], revalidate: 30 }
);

export async function readSettings(): Promise<SiteSettings> {
  try {
    return await readMerged();
  } catch {
    // never let a store hiccup break the whole site — fall back to defaults
    return DEFAULT_SETTINGS;
  }
}

/**
 * Validate + persist a patch on top of the current settings, then invalidate the
 * cached read so the next render (including the one that triggered the save) sees it.
 * Returns the merged result that was stored.
 */
export async function writeSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = mergeSettings(DEFAULT_SETTINGS, await readRaw());
  const next = mergeSettings(current, patch);
  await writeRaw(next);
  // Expire immediately (not stale-while-revalidate) so the very next read — including
  // this admin's own re-render and any visitor's next load — gets the new appearance.
  // The settings doc is tiny, so a blocking revalidate is cheap.
  revalidateTag(SETTINGS_TAG, { expire: 0 });
  return next;
}

// NOTE: server-only module (node:fs + process.env).
import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * Where the WhatsApp archive lives, and how sweeps behave by default.
 *
 * The settings themselves are kept inside the site's gitignored `.data/`
 * folder, because they have to be readable *before* we know the archive root.
 * The archive itself deliberately lives outside the repo — by default in
 * OneDrive, so every backup is mirrored off this machine without any of it
 * ever touching the public repo or the deployed host.
 */

export interface WhatsAppToolSettings {
  /** Absolute path to the archive root (a OneDrive folder by default). */
  archiveRoot: string;
  /** Chrome profile holding the linked WhatsApp session. */
  profileDir: string;
  /** 0 = sweep the whole history of each chat. */
  messageLimit: number;
  /** Capture image thumbnails that are loaded during the sweep. */
  media: boolean;
  /** Stop a partial sweep once this many already-archived messages in a row appear. */
  partialStopAfterKnown: number;
  /** Which browser the driver should use. */
  browser: "chrome" | "msedge" | "chromium";
  /** Show the browser window while sweeping. */
  headless: boolean;
  /** Locale hint for ambiguous dates; "auto" inspects each chat. */
  dateOrder: "auto" | "DMY" | "MDY" | "YMD";
  /** Chats to never archive (exact titles). */
  excluded: string[];
  /** Also write chat.txt / chat.md / chat.html next to each chat.json. */
  exports: boolean;
}

const SETTINGS_FILE = path.join(process.cwd(), ".data", "whatsapp-tool.json");

/** OneDrive's location varies by install; fall back to the home directory. */
function defaultArchiveRoot(): string {
  const oneDrive =
    process.env.OneDriveConsumer ||
    process.env.OneDrive ||
    process.env.OneDriveCommercial ||
    "";
  const base = oneDrive && oneDrive.trim() ? oneDrive : os.homedir();
  return path.join(base, "WhatsApp Archive");
}

export function defaultSettings(): WhatsAppToolSettings {
  return {
    archiveRoot: defaultArchiveRoot(),
    profileDir: path.join(process.cwd(), ".data", "whatsapp-profile"),
    messageLimit: 0,
    media: false,
    partialStopAfterKnown: 60,
    browser: "chrome",
    headless: false,
    dateOrder: "auto",
    excluded: [],
    exports: true,
  };
}

function coerce(raw: unknown, base: WhatsAppToolSettings): WhatsAppToolSettings {
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() ? v.trim() : fallback;
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

  const browser = r.browser === "msedge" || r.browser === "chromium" ? r.browser : base.browser;
  const order =
    r.dateOrder === "DMY" || r.dateOrder === "MDY" || r.dateOrder === "YMD"
      ? r.dateOrder
      : base.dateOrder;

  return {
    archiveRoot: str(r.archiveRoot, base.archiveRoot),
    profileDir: str(r.profileDir, base.profileDir),
    messageLimit: num(r.messageLimit, base.messageLimit),
    media: bool(r.media, base.media),
    partialStopAfterKnown: Math.max(10, num(r.partialStopAfterKnown, base.partialStopAfterKnown)),
    browser,
    headless: bool(r.headless, base.headless),
    dateOrder: order,
    excluded: Array.isArray(r.excluded)
      ? r.excluded.filter((x): x is string => typeof x === "string")
      : base.excluded,
    exports: bool(r.exports, base.exports),
  };
}

export async function readToolSettings(): Promise<WhatsAppToolSettings> {
  const base = defaultSettings();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    return coerce(JSON.parse(raw), base);
  } catch {
    return base;
  }
}

export async function writeToolSettings(
  patch: Partial<WhatsAppToolSettings>
): Promise<WhatsAppToolSettings> {
  const current = await readToolSettings();
  const next = coerce({ ...current, ...patch }, current);
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

/**
 * The tool drives a real browser and writes to a local disk, so it only works
 * when the site runs on your own machine. On a serverless host neither is
 * possible, and the archive must never be served from there anyway.
 */
export function isLocalRuntime(): boolean {
  if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return false;
  }
  return process.env.WHATSAPP_TOOL_ENABLED === "1" || process.env.NODE_ENV !== "production";
}

// NOTE: server-only module. Drives a real browser, so it only runs locally.
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import type { BrowserContext, Page } from "playwright-core";
import { installScraper } from "./page-scripts";

export const WA_URL = "https://web.whatsapp.com/";

/** Checked only if the Playwright channel lookup fails. */
const FALLBACK_BINARIES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

export interface SessionStatus {
  running: boolean;
  loggedIn: boolean;
  qrVisible?: boolean;
  hasMain?: boolean;
  url?: string;
  title?: string;
  error?: string;
}

export interface SessionOptions {
  profileDir: string;
  browser: "chrome" | "msedge" | "chromium";
  headless: boolean;
  /** Test hook: point the driver at a local mock instead of WhatsApp Web. */
  startUrl?: string;
}

/**
 * Owns the browser and the linked WhatsApp profile.
 *
 * The profile lives in the site's gitignored `.data/` folder, never in your
 * everyday Chrome profile: Chrome refuses to share a profile directory with a
 * running instance, and keeping them apart means this tool can never disturb
 * normal browsing. Linking the device once leaves a session there that
 * survives restarts, so the QR code is a one-time step.
 */
export class WhatsAppSession {
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private opts: SessionOptions;
  launchedWith: string | null = null;

  constructor(opts: SessionOptions) {
    this.opts = opts;
  }

  get isOpen(): boolean {
    return !!(this.context && this.page && !this.page.isClosed());
  }

  /** Non-null page; throws if the session was never started. */
  get activePage(): Page {
    if (!this.page) throw new Error("browser session is not running");
    return this.page;
  }

  async start(): Promise<void> {
    if (this.isOpen) return;

    await fs.mkdir(this.opts.profileDir, { recursive: true });
    // Imported here rather than at module scope so merely loading this file
    // (e.g. during a production build) never pulls in the browser driver.
    const { chromium } = await import("playwright-core");

    const base = {
      headless: this.opts.headless,
      // Headless has no window to size itself from, and a short viewport means
      // fewer virtualised rows are mounted per scroll step — which is how chats
      // at the end of a long list get missed. Give headless an explicit, tall
      // viewport; headed mode keeps using the real window.
      viewport: this.opts.headless ? { width: 1440, height: 1000 } : null,
      acceptDownloads: false,
      args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
    };

    const attempts: Array<{ label: string; opts: Record<string, unknown> }> = [];
    if (this.opts.browser !== "chromium") {
      attempts.push({ label: `channel:${this.opts.browser}`, opts: { channel: this.opts.browser } });
    }
    if (this.opts.browser !== "msedge") {
      attempts.push({ label: "channel:msedge", opts: { channel: "msedge" } });
    }
    attempts.push({ label: "bundled chromium", opts: {} });
    for (const bin of FALLBACK_BINARIES) {
      if (fsSync.existsSync(bin)) {
        attempts.push({ label: `binary:${path.basename(bin)}`, opts: { executablePath: bin } });
      }
    }

    let lastError: Error | null = null;
    for (const attempt of attempts) {
      try {
        this.context = await chromium.launchPersistentContext(this.opts.profileDir, {
          ...base,
          ...attempt.opts,
        });
        this.launchedWith = attempt.label;
        break;
      } catch (err) {
        lastError = err as Error;
      }
    }

    if (!this.context) {
      const message = lastError?.message.split("\n")[0] ?? "unknown error";
      const hint = /Executable doesn't exist|not found/i.test(lastError?.message ?? "")
        ? " — install Google Chrome, or run: npx playwright install chromium"
        : "";
      throw new Error(`could not start a browser: ${message}${hint}`);
    }

    this.page = this.context.pages()[0] ?? (await this.context.newPage());
    // Survives reloads and WhatsApp's own navigations.
    await this.context.addInitScript(installScraper);

    const target = this.opts.startUrl || WA_URL;
    if (!this.page.url().startsWith(target)) {
      await this.page.goto(target, { waitUntil: "domcontentloaded", timeout: 60_000 });
    }
    await this.ensureScraper();
  }

  /** Re-installing is cheap and idempotent; WhatsApp may have reloaded the page. */
  async ensureScraper(): Promise<void> {
    const page = this.activePage;
    try {
      await page.evaluate(installScraper);
    } catch (err) {
      if (/Execution context was destroyed|navigation/i.test((err as Error).message)) {
        await page.waitForLoadState("domcontentloaded").catch(() => {});
        await page.evaluate(installScraper);
        return;
      }
      throw err;
    }
  }

  async status(): Promise<SessionStatus> {
    if (!this.isOpen) return { running: false, loggedIn: false };
    try {
      await this.ensureScraper();
      const s = await this.activePage.evaluate(() => {
        const w = window as unknown as { __WCE: { status(): SessionStatus } };
        return w.__WCE.status();
      });
      return { ...s, running: true };
    } catch (err) {
      return { running: true, loggedIn: false, error: (err as Error).message };
    }
  }

  /** Poll until the chat list exists — the user scans the QR in the open window. */
  async waitForLogin(
    timeoutMs = 300_000,
    onTick?: (state: "qr" | "loading", status: SessionStatus) => void
  ): Promise<SessionStatus> {
    const deadline = Date.now() + timeoutMs;
    let lastState: string | null = null;
    while (Date.now() < deadline) {
      const s = await this.status();
      if (s.loggedIn) return s;

      // A second WhatsApp tab parks this one on a "Use here" screen.
      await this.activePage
        .evaluate(() => {
          const w = window as unknown as { __WCE: { clickUseHere(): string | false } };
          return w.__WCE.clickUseHere();
        })
        .catch(() => false);

      const state = s.qrVisible ? "qr" : "loading";
      if (state !== lastState) {
        lastState = state;
        onTick?.(state, s);
      }
      await this.activePage.waitForTimeout(1000);
    }
    throw new Error("timed out waiting for WhatsApp Web login");
  }

  async close(): Promise<void> {
    await this.context?.close().catch(() => {});
    this.context = null;
    this.page = null;
  }
}

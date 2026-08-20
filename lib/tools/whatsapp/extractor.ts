// NOTE: server-only module.
import type { Page } from "playwright-core";
import type { WhatsAppSession } from "./session";
import type { RawChatListItem, RawMessage } from "./page-scripts";

/**
 * Reading strategy
 * ----------------
 * WhatsApp Web virtualises both lists (only rows near the viewport exist in the
 * DOM) and fetches older history from the companion store on demand. There is
 * no "give me everything" call to hook, so this does what a person would do —
 * scroll and read — carefully enough to be lossless:
 *
 *   - harvest every mounted row each step, not just the new ones
 *   - dedupe on WhatsApp's own stable `data-id`
 *   - keep each step's row order, then replay the steps in reverse so the
 *     transcript is chronological even though the sweep ran backwards
 *   - stop only after several steps yield nothing new AND the scroller refuses
 *     to grow, so a slow history fetch is never mistaken for the chat's start
 */

interface ScraperApi {
  status(): unknown;
  readChatListPage(): { items: RawChatListItem[]; strategy?: string; atBottom: boolean; error?: string };
  scrollChatList(opts: { top?: boolean; to?: number; delta?: number }): { atBottom: boolean } | { error: string };
  locateChatRow(name: string): { x: number; y: number } | null;
  currentChat(): { name: string; subtitle: string; isGroup: boolean } | null;
  harvest(): {
    messages: RawMessage[];
    chat: { name: string; subtitle: string; isGroup: boolean } | null;
    scroll: { top: number; height: number; client: number } | null;
    loading: boolean;
    error?: string;
  };
  scrollMessages(opts: { top?: boolean; bottom?: boolean; delta?: number; factor?: number }): unknown;
  clickLoadMore(): string | false;
  clickUseHere(): string | false;
  clearSearch(): string | false;
  leaveSubView(): string | false;
  fetchBlob(url: string): Promise<{ ok: boolean; dataUrl: string; mime: string; size: number }>;
  diagnose(): {
    loggedIn: boolean;
    counts: Record<string, number>;
    hints: { openInOtherTab: boolean; useHereButton: boolean; qrLikely: boolean; loading: boolean };
    chatList?: { strategy: string; rowsWithNames: number };
  };
}

/**
 * The scraper is reached by plain property access on `window`. Deliberately no
 * `new Function`/eval wrapper: WhatsApp Web ships a strict CSP, and while
 * Playwright's own evaluate bypasses it, a nested eval inside the page would
 * not. TypeScript erases the cast, so the page only ever sees `window.__WCE.x()`.
 */
type WinWithScraper = { __WCE: ScraperApi };

const sleep = (page: Page, ms: number) => page.waitForTimeout(ms);

export interface SweepTuning {
  settleMs: number;
  stagnantRounds: number;
  maxRounds: number;
  deltaFactor: number;
}

export const DEFAULT_TUNING: SweepTuning = {
  settleMs: 450,
  stagnantRounds: 6,
  maxRounds: 2000,
  deltaFactor: 0.8,
};

/* ---------------------------------------------------------------- chats -- */

export async function listChats(
  session: WhatsAppSession,
  opts: { limit?: number; onProgress?: (found: number) => void } = {}
): Promise<RawChatListItem[]> {
  const page = session.activePage;
  const limit = opts.limit || 1000;
  await session.ensureScraper();

  const useHere = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.clickUseHere());
  if (useHere) {
    await sleep(page, 2500);
    await session.ensureScraper();
  }

  // Leftover search text filters the list; enumerating it then quietly misses
  // chats. Always start from an unfiltered list.
  const cleared = await page.evaluate(() =>
    (window as unknown as WinWithScraper).__WCE.clearSearch()
  );
  if (cleared) await sleep(page, 600);

  const found = new Map<string, RawChatListItem>();
  await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.scrollChatList({ top: true }));
  await sleep(page, 400);

  let stagnant = 0;
  for (let round = 0; round < 400; round++) {
    const res = await page.evaluate(() =>
      (window as unknown as WinWithScraper).__WCE.readChatListPage()
    );
    if (res.error) throw new Error(`chat list unavailable (${res.error})`);

    const before = found.size;
    for (const item of res.items) if (!found.has(item.name)) found.set(item.name, item);
    opts.onProgress?.(found.size);

    if (found.size >= limit) break;
    if (found.size === before) stagnant++;
    else stagnant = 0;
    if (res.atBottom && stagnant >= 2) break;
    if (stagnant >= 8) break;

    await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.scrollChatList({}));
    await sleep(page, 320);
  }

  if (found.size === 0) {
    const report = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.diagnose());
    if (report.hints.openInOtherTab || report.hints.useHereButton) {
      throw new Error(
        'WhatsApp Web is open in another tab. Close it, or click "Use here" in the window this tool opened.'
      );
    }
    throw new Error(
      `the chat list is on screen but no rows matched (best strategy: ${report.chatList?.strategy}). ` +
        "WhatsApp may have changed its markup."
    );
  }

  return [...found.values()].slice(0, limit);
}

/** Chat titles carry bidi marks and odd spacing; compare them forgivingly. */
function sameName(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (v: string | null | undefined) =>
    String(v ?? "")
      .replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  return !!norm(a) && norm(a) === norm(b);
}

/**
 * Put the side panel back into a known state: no sub-view, no search filter.
 * Called between chats so one awkward chat cannot strand the whole run - which
 * is exactly what happened when the "Archived" row was opened as if it were a
 * conversation.
 */
export async function resetToChatList(session: WhatsAppSession): Promise<void> {
  const page = session.activePage;
  await session.ensureScraper();
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(() => (window as unknown as WinWithScraper).__WCE.leaveSubView())
    .catch(() => false);
  await page
    .evaluate(() => (window as unknown as WinWithScraper).__WCE.clearSearch())
    .catch(() => false);
  await sleep(page, 350);
}

async function searchBox(page: Page) {
  const selectors = [
    '#side div[contenteditable="true"][data-tab]',
    'div[contenteditable="true"][data-tab="3"]',
    '[data-testid="chat-list-search"]',
    '#side div[contenteditable="true"]',
  ];
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count().catch(() => 0)) return loc;
  }
  return null;
}

async function clickRow(page: Page, name: string): Promise<boolean> {
  const box = await page.evaluate(
    (n) => (window as unknown as WinWithScraper).__WCE.locateChatRow(n),
    name
  );
  if (!box) return false;
  await sleep(page, 120);
  const again = await page.evaluate(
    (n) => (window as unknown as WinWithScraper).__WCE.locateChatRow(n),
    name
  );
  const target = again ?? box;
  await page.mouse.click(target.x, target.y);
  await sleep(page, 500);
  return true;
}

export async function currentChatName(page: Page): Promise<string | null> {
  const cur = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.currentChat());
  return cur?.name ?? null;
}

/** Search first (works however far down the list a chat is), then fall back to scrolling. */
export async function openChat(session: WhatsAppSession, name: string) {
  const page = session.activePage;
  await session.ensureScraper();

  if (sameName(await currentChatName(page), name)) {
    return page.evaluate(() => (window as unknown as WinWithScraper).__WCE.currentChat());
  }

  const box = await searchBox(page);
  if (box) {
    try {
      await box.click({ timeout: 5000 });
      await page.keyboard.press("Control+A").catch(() => {});
      await page.keyboard.press("Backspace").catch(() => {});
      await box.pressSequentially(name, { delay: 12 });
      await sleep(page, 900);
      if (await clickRow(page, name)) {
        if (sameName(await currentChatName(page), name)) {
          await page.keyboard.press("Escape").catch(() => {});
          return page.evaluate(() => (window as unknown as WinWithScraper).__WCE.currentChat());
        }
      }
      await page.keyboard.press("Escape").catch(() => {});
      await sleep(page, 300);
    } catch {
      /* fall through to scrolling */
    }
  }

  // Escape does not always clear WhatsApp's search box; scanning a still
  // filtered list is how a present chat reports as "not found".
  await resetToChatList(session);
  await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.scrollChatList({ top: true }));
  await sleep(page, 350);
  for (let round = 0; round < 400; round++) {
    if (await clickRow(page, name)) {
      if (sameName(await currentChatName(page), name)) {
        return page.evaluate(() => (window as unknown as WinWithScraper).__WCE.currentChat());
      }
    }
    const s = (await page.evaluate(() =>
      (window as unknown as WinWithScraper).__WCE.scrollChatList({})
    )) as { atBottom?: boolean } | null;
    await sleep(page, 260);
    if (!s || s.atBottom) break;
  }

  throw new Error(`chat "${name}" not found in the chat list`);
}

/* ---------------------------------------------------------------- sweep -- */

export interface SweepOptions {
  name: string;
  limit?: number;
  tuning?: Partial<SweepTuning>;
  /** Ids already in the vault — enables the early stop below. */
  knownIds?: Set<string>;
  /** Stop once this many consecutive already-archived messages appear. */
  stopAfterKnown?: number;
  mediaLimit?: number;
  saveMedia?: (messageId: string, dataUrl: string) => Promise<string | null>;
  onProgress?: (p: {
    collected: number;
    fresh: number;
    atTop: boolean;
    mediaSaved: number;
    round: number;
  }) => void;
  signal?: { cancelled: boolean };
}

export interface SweepResult {
  chat: { name: string; subtitle: string; isGroup: boolean } | null;
  messages: RawMessage[];
  rounds: number;
  reachedTop: boolean;
  mediaSaved: number;
  truncated: boolean;
  stoppedAtKnown: boolean;
}

/**
 * Walk a conversation newest → oldest and return every row read, in
 * chronological order.
 *
 * `knownIds` is what makes a *partial* update quick: once the sweep has walked
 * back into territory the vault already holds, there is nothing new above it,
 * so it stops instead of re-reading years of history. A full backup simply
 * passes no known ids and walks to the very beginning.
 */
export async function sweepChat(
  session: WhatsAppSession,
  opts: SweepOptions
): Promise<SweepResult> {
  const page = session.activePage;
  const tune: SweepTuning = { ...DEFAULT_TUNING, ...(opts.tuning ?? {}) };
  const limit = opts.limit && opts.limit > 0 ? opts.limit : Infinity;
  const mediaLimit = opts.mediaLimit ?? 800;
  const stopAfterKnown = opts.stopAfterKnown ?? 0;
  const known = opts.knownIds;

  const chat = await openChat(session, opts.name);

  await page.evaluate(() =>
    (window as unknown as WinWithScraper).__WCE.scrollMessages({ bottom: true })
  );
  await sleep(page, tune.settleMs);

  const byId = new Map<string, RawMessage>();
  const rounds: string[][] = [];
  let stagnant = 0;
  let lastHeight = -1;
  let loadMoreClicks = 0;
  let mediaSaved = 0;
  let reachedTop = false;
  let stoppedAtKnown = false;
  let knownStreak = 0;
  let round = 0;

  for (; round < tune.maxRounds; round++) {
    if (opts.signal?.cancelled) break;

    const res = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.harvest());
    if (res.error) throw new Error(`cannot read messages (${res.error})`);

    const ids: string[] = [];
    const freshOnes: RawMessage[] = [];
    let unknownInRound = 0;

    for (const m of res.messages) {
      ids.push(m.id);
      if (!byId.has(m.id)) {
        byId.set(m.id, m);
        freshOnes.push(m);
      } else {
        const prev = byId.get(m.id) as RawMessage;
        if ((m.text ?? "").length > (prev.text ?? "").length) {
          byId.set(m.id, { ...prev, ...m });
        }
      }
      if (known && !known.has(m.id) && m.kind === "message") unknownInRound++;
    }
    rounds.push(ids);

    // Capture thumbnails now: blob: URLs die when the row unmounts.
    if (opts.saveMedia && mediaSaved < mediaLimit) {
      for (const m of freshOnes) {
        if (mediaSaved >= mediaLimit) break;
        const thumb = m.media?.thumb;
        if (!thumb || thumb.slice(0, 5) !== "blob:") continue;
        try {
          const blob = await page.evaluate(
            (u) => (window as unknown as WinWithScraper).__WCE.fetchBlob(u),
            thumb
          );
          if (blob?.ok) {
            const rel = await opts.saveMedia(m.id, blob.dataUrl);
            if (rel && m.media) {
              m.media.file = rel;
              m.media.mime = blob.mime;
              m.media.bytes = blob.size;
              mediaSaved++;
            }
          }
        } catch {
          /* a thumbnail is never worth failing a backup over */
        }
      }
    }

    const height = res.scroll?.height ?? 0;
    const atTop = (res.scroll?.top ?? 1) <= 2;

    opts.onProgress?.({ collected: byId.size, fresh: freshOnes.length, atTop, mediaSaved, round });

    // Partial update: we have walked back into already-archived history.
    if (stopAfterKnown > 0 && known) {
      knownStreak = unknownInRound === 0 ? knownStreak + res.messages.length : 0;
      if (knownStreak >= stopAfterKnown) {
        stoppedAtKnown = true;
        break;
      }
    }

    if (byId.size >= limit) break;

    if (freshOnes.length === 0 && height === lastHeight) stagnant++;
    else stagnant = 0;
    lastHeight = height;

    if (stagnant >= tune.stagnantRounds) {
      const clicked = await page.evaluate(() =>
        (window as unknown as WinWithScraper).__WCE.clickLoadMore()
      );
      if (clicked && loadMoreClicks < 5) {
        loadMoreClicks++;
        stagnant = 0;
        await sleep(page, 1500);
        continue;
      }
      reachedTop = atTop;
      break;
    }

    await page.evaluate(
      (f) => (window as unknown as WinWithScraper).__WCE.scrollMessages({ factor: f }),
      tune.deltaFactor
    );
    await sleep(page, tune.settleMs);

    // Fetching older history shows a spinner — give it room rather than
    // counting the wait as "nothing new".
    for (let waited = 0; waited < 6; waited++) {
      const st = await page.evaluate(() => (window as unknown as WinWithScraper).__WCE.harvest());
      if (!st.loading) break;
      await sleep(page, 500);
    }
  }

  // The sweep ran newest → oldest, so replaying the steps in reverse yields
  // oldest → newest; within a step the rows are already in document order.
  const seen = new Set<string>();
  let ordered: RawMessage[] = [];
  for (let i = rounds.length - 1; i >= 0; i--) {
    for (const id of rounds[i]) {
      if (seen.has(id)) continue;
      seen.add(id);
      const m = byId.get(id);
      if (m) ordered.push(m);
    }
  }
  if (ordered.length > limit) ordered = ordered.slice(ordered.length - limit);

  for (const m of ordered) {
    if (m.media?.thumb) delete m.media.thumb; // blob: URLs mean nothing later
  }

  return {
    chat,
    messages: ordered,
    rounds: rounds.length,
    reachedTop,
    mediaSaved,
    truncated: limit !== Infinity && ordered.length >= limit,
    stoppedAtKnown,
  };
}

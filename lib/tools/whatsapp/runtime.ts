// NOTE: server-only module.
import { WhatsAppSession } from "./session";
import { readToolSettings } from "./settings";

/**
 * Long-lived state for the tool: one browser session and a registry of running
 * jobs.
 *
 * Both are hung off `globalThis` because Next's dev server hot-reloads modules
 * on every edit. Without that, saving a file mid-backup would orphan a Chrome
 * window and lose the job you were watching.
 */

export type JobKind = "backup" | "chats" | "session" | "sync";
export type JobState = "queued" | "running" | "done" | "failed" | "cancelled";

export interface JobEvent {
  at: number;
  phase: string;
  [key: string]: unknown;
}

export interface Job {
  id: string;
  kind: JobKind;
  label: string;
  state: JobState;
  startedAt: string;
  finishedAt: string | null;
  events: JobEvent[];
  result: unknown;
  error: string | null;
  cancel: { cancelled: boolean };
  listeners: Set<(ev: JobEvent) => void>;
}

interface ToolRuntime {
  session: WhatsAppSession | null;
  jobs: Map<string, Job>;
  seq: number;
  chain: Promise<unknown>;
}

const KEY = "__whatsappToolRuntime" as const;
type GlobalWithRuntime = typeof globalThis & { [KEY]?: ToolRuntime };

function runtime(): ToolRuntime {
  const g = globalThis as GlobalWithRuntime;
  if (!g[KEY]) {
    g[KEY] = { session: null, jobs: new Map(), seq: 0, chain: Promise.resolve() };
  }
  return g[KEY];
}

/* -------------------------------------------------------------- session -- */

export async function getSession(): Promise<WhatsAppSession> {
  const rt = runtime();
  if (rt.session?.isOpen) return rt.session;

  const settings = await readToolSettings();
  rt.session = new WhatsAppSession({
    profileDir: settings.profileDir,
    browser: settings.browser,
    headless: settings.headless,
    // Test hook: point the driver at a local mock of WhatsApp Web so the whole
    // pipeline can be exercised without touching a real account.
    startUrl: process.env.WHATSAPP_TOOL_START_URL || undefined,
  });
  await rt.session.start();
  return rt.session;
}

export function peekSession(): WhatsAppSession | null {
  const rt = runtime();
  return rt.session?.isOpen ? rt.session : null;
}

export async function closeSession(): Promise<void> {
  const rt = runtime();
  await rt.session?.close();
  rt.session = null;
}

/* ----------------------------------------------------------------- jobs -- */

export function createJob(kind: JobKind, label: string): Job {
  const rt = runtime();
  const job: Job = {
    id: `${kind}-${++rt.seq}-${Date.now().toString(36)}`,
    kind,
    label,
    state: "queued",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    events: [],
    result: null,
    error: null,
    cancel: { cancelled: false },
    listeners: new Set(),
  };
  rt.jobs.set(job.id, job);

  // Keep the registry from growing without bound across a long dev session.
  if (rt.jobs.size > 40) {
    const stale = [...rt.jobs.values()]
      .filter((j) => j.state !== "running" && j.state !== "queued")
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      .slice(0, 10);
    for (const j of stale) rt.jobs.delete(j.id);
  }
  return job;
}

export function getJob(id: string): Job | null {
  return runtime().jobs.get(id) ?? null;
}

export function listJobs(): Job[] {
  return [...runtime().jobs.values()];
}

// Not `Omit<JobEvent, "at">`: JobEvent has an index signature, and Omit
// collapses it back to `{ [x: string]: unknown }`, losing `phase`.
export function emit(job: Job, event: { phase: string; [key: string]: unknown }): void {
  const payload: JobEvent = { ...event, at: Date.now() };
  job.events.push(payload);
  if (job.events.length > 5000) job.events.splice(0, 2000);
  for (const listener of job.listeners) {
    try {
      listener(payload);
    } catch {
      /* a dead SSE listener must not break the run */
    }
  }
}

function settle(job: Job, state: JobState, result: unknown, error: unknown): void {
  job.state = state;
  job.result = result ?? null;
  job.error = error ? String((error as Error).message ?? error) : null;
  job.finishedAt = new Date().toISOString();
  emit(job, { phase: state, result: job.result, error: job.error });
  job.listeners.clear();
}

/**
 * Run work on the shared browser, one job at a time. Two sweeps driving the
 * same page would fight over which chat is open.
 */
export function runQueued<T>(job: Job, work: (job: Job) => Promise<T>): Job {
  const rt = runtime();
  rt.chain = rt.chain.then(async () => {
    if (job.cancel.cancelled) {
      settle(job, "cancelled", null, null);
      return;
    }
    job.state = "running";
    emit(job, { phase: "started", label: job.label });
    try {
      const result = await work(job);
      settle(job, job.cancel.cancelled ? "cancelled" : "done", result, null);
    } catch (err) {
      settle(job, "failed", null, err);
    }
  });
  return job;
}

export function cancelJob(id: string): boolean {
  const job = getJob(id);
  if (!job || job.state === "done" || job.state === "failed") return false;
  job.cancel.cancelled = true;
  emit(job, { phase: "cancelling" });
  return true;
}

/** Shape sent to the browser — listeners and cancel flags stay server-side. */
export function publicJob(job: Job, eventLimit = 200) {
  return {
    id: job.id,
    kind: job.kind,
    label: job.label,
    state: job.state,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    result: job.result,
    error: job.error,
    events: job.events.slice(-eventLimit),
  };
}

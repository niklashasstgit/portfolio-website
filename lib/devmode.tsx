"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { projects } from "@/content/projects-index";

/**
 * Hidden developer mode.
 *
 * Entry gesture: click the "N. BLATTNER" wordmark in the nav *exactly* four
 * times, then pause for ~3s. Three-or-fewer or five-or-more clicks do nothing
 * (the logo just behaves as a normal link to the start page), so the gesture
 * is undiscoverable unless you already know it.
 *
 * Exiting is *not* a secret: once you're already in dev mode, the fourth click
 * of the wordmark drops you back to normal mode instantly — no settle pause.
 * (You can also hit the Exit button in the dev panel.)
 *
 * The password is never shipped in plaintext — only a salted SHA-256 digest is
 * embedded, and the entered value is hashed client-side (Web Crypto) and
 * compared to it. Reading the bundle reveals the salt and the digest, not the
 * password, so it can't be lifted by "just inspecting the webpage".
 *
 * Featured flags and dev-panel settings live in localStorage (there's no
 * backend); the unlocked state lives in sessionStorage so a reload keeps you in
 * dev mode for the session.
 */

const FEATURED_KEY = "nb.featured.v1";
const DEV_SESSION_KEY = "nb.dev.v1";
const SETTINGS_KEY = "nb.devsettings.v1";
const PW_SALT = "blattner-dev::v1::";
// salted SHA-256 of the developer password — see PW_SALT above
const PW_HASH = "c15ba7394ef4d7d1129eaae524f994119bfa91d1db692c630a3d5d3804b39785";

const REQUIRED_CLICKS = 4;
const SETTLE_MS = 3000;

async function sha256hex(message: string): Promise<string> {
  const bytes = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

type BgPresetKey = "void" | "slate" | "blueprint" | "black" | "carbon";

type DevSettings = {
  /** accent colour hex, applied to --color-accent */
  accent: string;
  /** background palette preset */
  bg: BgPresetKey;
  /** blueprint grid overlay across the whole viewport */
  grid: boolean;
  /** outline every element (layout debugging) */
  outline: boolean;
  /** live FPS meter badge */
  fps: boolean;
  /** cursor coordinate readout */
  coords: boolean;
  /** freeze all CSS animations + transitions */
  pauseAnim: boolean;
};

const DEFAULT_ACCENT = "#ff6a2c";

const DEFAULT_SETTINGS: DevSettings = {
  accent: DEFAULT_ACCENT,
  bg: "void",
  grid: false,
  outline: false,
  fps: false,
  coords: false,
  pauseAnim: false,
};

const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: "Ember", hex: "#ff6a2c" },
  { name: "Teal", hex: "#52d9c4" },
  { name: "Azure", hex: "#3b82f6" },
  { name: "Violet", hex: "#a855f7" },
  { name: "Lime", hex: "#22c55e" },
  { name: "Rose", hex: "#f43f5e" },
];

const BG_PRESETS: Record<BgPresetKey, { name: string; bg: string; raised: string; raised2: string }> = {
  void: { name: "Void", bg: "#0a0c10", raised: "#10141b", raised2: "#161b24" },
  slate: { name: "Slate", bg: "#0f172a", raised: "#1e293b", raised2: "#334155" },
  blueprint: { name: "Blueprint", bg: "#081826", raised: "#0e2338", raised2: "#143050" },
  black: { name: "Pure Black", bg: "#000000", raised: "#0b0b0b", raised2: "#151515" },
  carbon: { name: "Carbon", bg: "#121212", raised: "#1c1c1c", raised2: "#262626" },
};

/** 0.14 alpha ≈ 0x24 — used to derive --color-accent-soft from the accent hex */
const SOFT_ALPHA = "24";

function loadSettings(): DevSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}");
    return { ...DEFAULT_SETTINGS, ...(raw && typeof raw === "object" ? raw : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type DevModeValue = {
  /** true once the client has mounted — gate localStorage-derived UI on this */
  mounted: boolean;
  isDev: boolean;
  isFeatured: (slug: string) => boolean;
  toggleFeatured: (slug: string) => void;
  /** call on every click of the secret wordmark */
  registerLogoClick: () => void;
};

const DevModeContext = createContext<DevModeValue | null>(null);

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [featured, setFeatured] = useState<Set<string>>(new Set());
  const [loginOpen, setLoginOpen] = useState(false);
  const [settings, setSettings] = useState<DevSettings>(DEFAULT_SETTINGS);

  // hydrate persisted state after mount (never during SSR)
  useEffect(() => {
    setMounted(true);
    try {
      const raw = JSON.parse(localStorage.getItem(FEATURED_KEY) ?? "[]");
      if (Array.isArray(raw)) setFeatured(new Set(raw.filter((s) => typeof s === "string")));
    } catch {
      /* ignore corrupt storage */
    }
    try {
      if (sessionStorage.getItem(DEV_SESSION_KEY) === "1") setIsDev(true);
    } catch {
      /* ignore */
    }
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (isDev) sessionStorage.setItem(DEV_SESSION_KEY, "1");
      else sessionStorage.removeItem(DEV_SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [isDev, mounted]);

  // persist settings
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, mounted]);

  // apply appearance settings to the document — only while in dev mode, and
  // always cleaned up on exit so normal visitors see the real design.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const clear = () => {
      root.style.removeProperty("--color-accent");
      root.style.removeProperty("--color-accent-soft");
      root.style.removeProperty("--color-bg");
      root.style.removeProperty("--color-bg-raised");
      root.style.removeProperty("--color-bg-raised-2");
      root.classList.remove("dev-outline", "dev-pause-anim");
    };

    if (!isDev) {
      clear();
      return;
    }

    root.style.setProperty("--color-accent", settings.accent);
    root.style.setProperty("--color-accent-soft", `${settings.accent}${SOFT_ALPHA}`);
    const bg = BG_PRESETS[settings.bg] ?? BG_PRESETS.void;
    root.style.setProperty("--color-bg", bg.bg);
    root.style.setProperty("--color-bg-raised", bg.raised);
    root.style.setProperty("--color-bg-raised-2", bg.raised2);
    root.classList.toggle("dev-outline", settings.outline);
    root.classList.toggle("dev-pause-anim", settings.pauseAnim);

    return clear;
  }, [isDev, settings, mounted]);

  const updateSetting = useCallback(
    <K extends keyof DevSettings>(key: K, value: DevSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const toggleFeatured = useCallback((slug: string) => {
    setFeatured((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(FEATURED_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setFeaturedSet = useCallback((slugs: string[]) => {
    const next = new Set(slugs);
    setFeatured(next);
    try {
      localStorage.setItem(FEATURED_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }, []);

  const isFeatured = useCallback((slug: string) => featured.has(slug), [featured]);

  // --- the secret four-click gesture ---
  const clickCount = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDevRef = useRef(isDev);
  isDevRef.current = isDev;

  const registerLogoClick = useCallback(() => {
    // Already in dev mode → exiting is not a secret. The fourth click drops you
    // out instantly, no settle pause.
    if (isDevRef.current) {
      clickCount.current += 1;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      if (clickCount.current >= REQUIRED_CLICKS) {
        clickCount.current = 0;
        setIsDev(false);
        return;
      }
      // forget a partial streak if they wander off for a bit
      settleTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, SETTLE_MS);
      return;
    }

    // Not in dev mode → entry stays hidden behind exactly-four-then-pause.
    clickCount.current += 1;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const count = clickCount.current;
      clickCount.current = 0;
      if (count === REQUIRED_CLICKS) setLoginOpen(true);
    }, SETTLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    []
  );

  const unlock = useCallback(() => {
    setIsDev(true);
    setLoginOpen(false);
  }, []);

  return (
    <DevModeContext.Provider
      value={{ mounted, isDev, isFeatured, toggleFeatured, registerLogoClick }}
    >
      {children}
      {loginOpen && <DevLogin onUnlock={unlock} onClose={() => setLoginOpen(false)} />}
      {mounted && isDev && (
        <>
          <DevOverlays settings={settings} />
          <DevPanel
            settings={settings}
            updateSetting={updateSetting}
            resetSettings={resetSettings}
            featuredCount={featured.size}
            featureAll={() => setFeaturedSet(projects.map((p) => p.slug))}
            clearFeatured={() => setFeaturedSet([])}
            onExit={() => setIsDev(false)}
          />
        </>
      )}
    </DevModeContext.Provider>
  );
}

export function useDevMode(): DevModeValue {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used within DevModeProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function DevLogin({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    const ok = (await sha256hex(PW_SALT + pw)) === PW_HASH;
    setChecking(false);
    if (ok) {
      onUnlock();
    } else {
      setError(true);
      setPw("");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="w-[min(90vw,22rem)] rounded-2xl border border-line bg-bg-raised p-6 shadow-2xl shadow-black/50"
      >
        <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
          Restricted
        </span>
        <h2 className="mt-2 text-lg font-semibold text-fg">Developer access</h2>
        <p className="mt-1 text-sm text-fg-muted">Enter the passphrase to continue.</p>
        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            if (error) setError(false);
          }}
          autoComplete="off"
          spellCheck={false}
          aria-label="Developer passphrase"
          aria-invalid={error}
          className={`mt-4 w-full rounded-lg border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition-colors focus:border-accent ${
            error ? "border-red-500/70" : "border-line"
          }`}
        />
        {error && <p className="mt-2 text-xs text-red-400">Incorrect passphrase.</p>}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={checking}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {checking ? "Checking…" : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live overlays (grid / FPS / coordinates)                           */
/* ------------------------------------------------------------------ */

function DevOverlays({ settings }: { settings: DevSettings }) {
  return (
    <>
      {settings.grid && (
        <div
          aria-hidden
          className="bp-grid pointer-events-none fixed inset-0 z-[80] opacity-60"
        />
      )}
      {settings.fps && <FpsBadge />}
      {settings.coords && <CoordsBadge />}
    </>
  );
}

function FpsBadge() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const tick = () => {
      frames += 1;
      const now = performance.now();
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="font-mono-tight pointer-events-none fixed right-4 top-4 z-[90] select-none rounded-md border border-accent/40 bg-bg/85 px-2.5 py-1 text-[11px] tabular-nums text-accent backdrop-blur">
      {fps} FPS
    </div>
  );
}

function CoordsBadge() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0;
    let next = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      next = { x: e.clientX, y: e.clientY };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setPos(next);
          raf = 0;
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="font-mono-tight pointer-events-none fixed right-4 top-[3.25rem] z-[90] select-none rounded-md border border-line bg-bg/85 px-2.5 py-1 text-[11px] tabular-nums text-fg-muted backdrop-blur">
      x {pos.x} · y {pos.y}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dev panel                                                           */
/* ------------------------------------------------------------------ */

type PanelProps = {
  settings: DevSettings;
  updateSetting: <K extends keyof DevSettings>(key: K, value: DevSettings[K]) => void;
  resetSettings: () => void;
  featuredCount: number;
  featureAll: () => void;
  clearFeatured: () => void;
  onExit: () => void;
};

function DevPanel({
  settings,
  updateSetting,
  resetSettings,
  featuredCount,
  featureAll,
  clearFeatured,
  onExit,
}: PanelProps) {
  const [open, setOpen] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[95] select-none">
      {open && (
        <div className="mb-2 w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-line-strong bg-bg-raised/95 shadow-2xl shadow-black/60 backdrop-blur">
          {/* header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
              Dev Console
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse dev panel"
              className="text-fg-muted transition-colors hover:text-fg"
            >
              <span className="font-mono-tight text-xs">▾</span>
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            {/* appearance */}
            <Section title="Accent">
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={settings.accent.toLowerCase() === c.hex.toLowerCase()}
                    onClick={() => updateSetting("accent", c.hex)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      settings.accent.toLowerCase() === c.hex.toLowerCase()
                        ? "border-fg"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <label
                  title="Custom colour"
                  className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-line-strong"
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "conic-gradient(#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7,#f43f5e)",
                    }}
                  />
                  <input
                    type="color"
                    value={settings.accent}
                    onChange={(e) => updateSetting("accent", e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Custom accent colour"
                  />
                </label>
              </div>
            </Section>

            <Section title="Background">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(BG_PRESETS) as BgPresetKey[]).map((key) => {
                  const p = BG_PRESETS[key];
                  const active = settings.bg === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateSetting("bg", key)}
                      aria-pressed={active}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                        active
                          ? "border-accent/60 text-fg"
                          : "border-line text-fg-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-line-strong"
                        style={{ backgroundColor: p.bg }}
                      />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* debug overlays */}
            <Section title="Debug overlays">
              <Toggle
                label="Blueprint grid"
                checked={settings.grid}
                onChange={(v) => updateSetting("grid", v)}
              />
              <Toggle
                label="Outline elements"
                checked={settings.outline}
                onChange={(v) => updateSetting("outline", v)}
              />
              <Toggle
                label="FPS meter"
                checked={settings.fps}
                onChange={(v) => updateSetting("fps", v)}
              />
              <Toggle
                label="Cursor coordinates"
                checked={settings.coords}
                onChange={(v) => updateSetting("coords", v)}
              />
              <Toggle
                label="Freeze animations"
                checked={settings.pauseAnim}
                onChange={(v) => updateSetting("pauseAnim", v)}
              />
            </Section>

            {/* featured content */}
            <Section title={`Featured · ${featuredCount}`}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={featureAll}
                  className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                  Feature all
                </button>
                <button
                  type="button"
                  onClick={clearFeatured}
                  className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-fg-muted transition-colors hover:border-red-500/60 hover:text-red-400"
                >
                  Clear all
                </button>
              </div>
            </Section>

            {/* session */}
            <Section title="Session">
              <dl className="font-mono-tight space-y-1 text-[11px] text-fg-muted">
                <div className="flex justify-between">
                  <dt>Viewport</dt>
                  <dd className="tabular-nums text-fg">
                    {viewport ? `${viewport.w} × ${viewport.h}` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Projects</dt>
                  <dd className="tabular-nums text-fg">{projects.length}</dd>
                </div>
              </dl>
            </Section>

            {/* actions */}
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={resetSettings}
                className="flex-1 rounded-full border border-line px-3 py-2 text-xs text-fg-muted transition-colors hover:text-fg"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-1 rounded-full bg-accent px-3 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90"
              >
                Exit dev mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* the pill — click to open the console */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono-tight inline-flex items-center gap-2 rounded-full border border-accent/50 bg-bg/85 px-3 py-1.5 text-[10px] uppercase tracking-widest text-accent backdrop-blur transition-colors hover:border-accent hover:bg-bg"
        title={open ? "Close dev console" : "Open dev console"}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Dev mode
        <span className="text-accent/70">{open ? "▾" : "▸"}</span>
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-3 first:pt-0 last:border-b-0">
      <p className="font-mono-tight mb-2 text-[10px] uppercase tracking-widest text-fg-faint">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between text-left text-xs text-fg-muted transition-colors hover:text-fg"
    >
      <span>{label}</span>
      <span
        className={`relative h-4 w-7 flex-shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-line-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

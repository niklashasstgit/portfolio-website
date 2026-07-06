"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects-index";
import {
  ACCENT_PRESETS,
  BG_PRESETS,
  DEFAULT_SETTINGS,
  settingsToCssVars,
  type BgPresetKey,
  type SiteSettings,
} from "@/lib/site-settings";
import { PW_HASH, PW_SALT, sha256hex } from "@/lib/dev-auth";

/**
 * Hidden developer mode.
 *
 * Entry gesture: click the "N. BLATTNER" wordmark in the nav *exactly* four times,
 * then pause ~3s. Fewer/more clicks do nothing, so it's undiscoverable unless known.
 * Once in dev mode the fourth click drops you back out instantly.
 *
 * Unlike the old version, settings now live **server-side** (see lib/site-settings-store.ts):
 * a save publishes them for every visitor on every device. The dev panel edits a local
 * *draft* for instant preview, then POSTs it to /api/site-settings on Save. The published
 * values are injected into every page by the root layout, so ordinary visitors get the
 * current look with no client JS and no flash.
 *
 * `sessionStorage` keeps you unlocked (and remembers the passphrase, needed to authorize
 * saves) for the browser session; it is cleared on exit.
 */

const DEV_SESSION_KEY = "nb.dev.v1";
const PW_SESSION_KEY = "nb.dev.pw.v1";

const REQUIRED_CLICKS = 4;
const SETTLE_MS = 3000;

/** Purely local, dev-only debug overlays — never published to visitors. */
type DebugFlags = {
  grid: boolean;
  outline: boolean;
  fps: boolean;
  coords: boolean;
  pauseAnim: boolean;
};
const DEFAULT_DEBUG: DebugFlags = {
  grid: false,
  outline: false,
  fps: false,
  coords: false,
  pauseAnim: false,
};

/** CSS var keys we set inline while previewing — kept stable so we can clear them all. */
const PREVIEW_VAR_KEYS = Object.keys(settingsToCssVars(DEFAULT_SETTINGS));

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type DevModeValue = {
  mounted: boolean;
  isDev: boolean;
  /** effective (draft while in dev, else published) structural toggles */
  toggles: SiteSettings["toggles"];
  /** effective text-content overrides */
  content: SiteSettings["content"];
  isFeatured: (slug: string) => boolean;
  toggleFeatured: (slug: string) => void;
  registerLogoClick: () => void;
};

const DevModeContext = createContext<DevModeValue | null>(null);

export function DevModeProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // published = last-known server state; draft = what the panel is editing.
  const [published, setPublished] = useState<SiteSettings>(initialSettings);
  const [draft, setDraft] = useState<SiteSettings>(initialSettings);
  const [debug, setDebug] = useState<DebugFlags>(DEFAULT_DEBUG);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  // the entered passphrase, needed to authorize saves. Memory + sessionStorage only.
  const pwRef = useRef<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(published),
    [draft, published]
  );

  // hydrate session state after mount (never during SSR)
  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(DEV_SESSION_KEY) === "1") {
        setIsDev(true);
        pwRef.current = sessionStorage.getItem(PW_SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (isDev) sessionStorage.setItem(DEV_SESSION_KEY, "1");
      else {
        sessionStorage.removeItem(DEV_SESSION_KEY);
        sessionStorage.removeItem(PW_SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [isDev, mounted]);

  // Live preview: while in dev mode, mirror the draft onto <html> as inline styles
  // (which beat the layout's published <style>), plus debug classes. On exit we strip
  // everything so the server-published appearance shows through untouched.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const clear = () => {
      for (const k of PREVIEW_VAR_KEYS) root.style.removeProperty(k);
      root.classList.remove("dev-outline", "dev-pause-anim", "site-no-anim");
    };

    if (!isDev) {
      clear();
      return;
    }

    const vars = settingsToCssVars(draft);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    root.classList.toggle("dev-outline", debug.outline);
    root.classList.toggle("dev-pause-anim", debug.pauseAnim);
    root.classList.toggle("site-no-anim", !draft.toggles.animations);

    return clear;
  }, [isDev, draft, debug, mounted]);

  /* ---- draft mutators ---- */
  const setColor = useCallback((key: keyof SiteSettings["colors"], value: string) => {
    setDraft((p) => ({ ...p, colors: { ...p.colors, [key]: value } }));
  }, []);
  const setBg = useCallback((bg: BgPresetKey) => setDraft((p) => ({ ...p, bg })), []);
  const setType = useCallback(
    (key: keyof SiteSettings["typography"], value: number) =>
      setDraft((p) => ({ ...p, typography: { ...p.typography, [key]: value } })),
    []
  );
  const setToggle = useCallback(
    (key: keyof SiteSettings["toggles"], value: boolean) =>
      setDraft((p) => ({ ...p, toggles: { ...p.toggles, [key]: value } })),
    []
  );
  const setDebugFlag = useCallback(
    (key: keyof DebugFlags, value: boolean) => setDebug((p) => ({ ...p, [key]: value })),
    []
  );

  const toggleFeatured = useCallback((slug: string) => {
    setDraft((p) => {
      const has = p.featured.includes(slug);
      return {
        ...p,
        featured: has ? p.featured.filter((s) => s !== slug) : [...p.featured, slug],
      };
    });
  }, []);
  const setFeatured = useCallback(
    (slugs: string[]) => setDraft((p) => ({ ...p, featured: slugs })),
    []
  );
  const isFeatured = useCallback((slug: string) => draft.featured.includes(slug), [draft.featured]);

  const revertToPublished = useCallback(() => setDraft(published), [published]);
  const resetToDefaults = useCallback(
    () => setDraft({ ...DEFAULT_SETTINGS, featured: draft.featured }),
    [draft.featured]
  );

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwRef.current ?? "", patch: draft }),
      });
      if (res.status === 401) throw new Error("Auth expired — exit and re-enter dev mode.");
      if (!res.ok) throw new Error("Save failed. Try again.");
      const saved = (await res.json()) as SiteSettings;
      setPublished(saved);
      setDraft(saved);
      setSavedTick((t) => t + 1);
      // re-render server components so the injected <style> matches the new published state
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [draft, router]);

  const discard = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings", { cache: "no-store" });
      if (res.ok) {
        const s = (await res.json()) as SiteSettings;
        setPublished(s);
        setDraft(s);
      } else {
        revertToPublished();
      }
    } catch {
      revertToPublished();
    }
  }, [revertToPublished]);

  /* ---- secret four-click gesture ---- */
  const clickCount = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDevRef = useRef(isDev);
  isDevRef.current = isDev;

  const registerLogoClick = useCallback(() => {
    if (isDevRef.current) {
      clickCount.current += 1;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      if (clickCount.current >= REQUIRED_CLICKS) {
        clickCount.current = 0;
        setIsDev(false);
        return;
      }
      settleTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, SETTLE_MS);
      return;
    }

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

  const unlock = useCallback((pw: string) => {
    pwRef.current = pw;
    try {
      sessionStorage.setItem(PW_SESSION_KEY, pw);
    } catch {
      /* ignore */
    }
    setIsDev(true);
    setLoginOpen(false);
  }, []);

  const value = useMemo<DevModeValue>(
    () => ({
      mounted,
      isDev,
      toggles: draft.toggles,
      content: draft.content,
      isFeatured,
      toggleFeatured,
      registerLogoClick,
    }),
    [mounted, isDev, draft.toggles, draft.content, isFeatured, toggleFeatured, registerLogoClick]
  );

  return (
    <DevModeContext.Provider value={value}>
      {children}
      {loginOpen && <DevLogin onUnlock={unlock} onClose={() => setLoginOpen(false)} />}
      {mounted && isDev && (
        <>
          <DevOverlays debug={debug} />
          <DevPanel
            draft={draft}
            debug={debug}
            dirty={dirty}
            saving={saving}
            saveError={saveError}
            savedTick={savedTick}
            setColor={setColor}
            setBg={setBg}
            setType={setType}
            setToggle={setToggle}
            setDebugFlag={setDebugFlag}
            featureAll={() => setFeatured(projects.map((p) => p.slug))}
            clearFeatured={() => setFeatured([])}
            onSave={save}
            onDiscard={discard}
            onRevert={revertToPublished}
            onResetDefaults={resetToDefaults}
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

function DevLogin({
  onUnlock,
  onClose,
}: {
  onUnlock: (pw: string) => void;
  onClose: () => void;
}) {
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
      onUnlock(pw);
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

function DevOverlays({ debug }: { debug: DebugFlags }) {
  return (
    <>
      {debug.grid && (
        <div aria-hidden className="bp-grid pointer-events-none fixed inset-0 z-[80] opacity-60" />
      )}
      {debug.fps && <FpsBadge />}
      {debug.coords && <CoordsBadge />}
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
  draft: SiteSettings;
  debug: DebugFlags;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  savedTick: number;
  setColor: (key: keyof SiteSettings["colors"], value: string) => void;
  setBg: (bg: BgPresetKey) => void;
  setType: (key: keyof SiteSettings["typography"], value: number) => void;
  setToggle: (key: keyof SiteSettings["toggles"], value: boolean) => void;
  setDebugFlag: (key: keyof DebugFlags, value: boolean) => void;
  featureAll: () => void;
  clearFeatured: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onRevert: () => void;
  onResetDefaults: () => void;
  onExit: () => void;
};

const COLOR_FIELDS: { key: keyof SiteSettings["colors"]; label: string }[] = [
  { key: "accent", label: "Accent" },
  { key: "accent2", label: "Accent 2" },
  { key: "fg", label: "Text" },
  { key: "fgMuted", label: "Text muted" },
  { key: "fgFaint", label: "Text faint" },
  { key: "line", label: "Lines" },
  { key: "lineStrong", label: "Lines strong" },
];

function DevPanel({
  draft,
  debug,
  dirty,
  saving,
  saveError,
  savedTick,
  setColor,
  setBg,
  setType,
  setToggle,
  setDebugFlag,
  featureAll,
  clearFeatured,
  onSave,
  onDiscard,
  onRevert,
  onResetDefaults,
  onExit,
}: PanelProps) {
  const [open, setOpen] = useState(true);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // brief "Saved ✓" flash whenever a save completes
  useEffect(() => {
    if (savedTick === 0) return;
    setJustSaved(true);
    const t = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(t);
  }, [savedTick]);

  return (
    <div className="fixed bottom-4 left-4 z-[95] select-none">
      {open && (
        <div className="mb-2 w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-line-strong bg-bg-raised/95 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-mono-tight text-[10px] uppercase tracking-[0.25em] text-accent">
              Dev Console
            </span>
            <div className="flex items-center gap-2">
              {dirty && (
                <span className="font-mono-tight text-[9px] uppercase tracking-widest text-amber-400">
                  Unsaved
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse dev panel"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                <span className="font-mono-tight text-xs">▾</span>
              </button>
            </div>
          </div>

          <div className="max-h-[68vh] overflow-y-auto px-4 py-3">
            <Section title="Accent presets">
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={draft.colors.accent.toLowerCase() === c.hex.toLowerCase()}
                    onClick={() => setColor("accent", c.hex)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      draft.colors.accent.toLowerCase() === c.hex.toLowerCase()
                        ? "border-fg"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </Section>

            <Section title="Colours">
              {COLOR_FIELDS.map((f) => (
                <ColorField
                  key={f.key}
                  label={f.label}
                  value={draft.colors[f.key]}
                  onChange={(v) => setColor(f.key, v)}
                />
              ))}
            </Section>

            <Section title="Background">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(BG_PRESETS) as BgPresetKey[]).map((key) => {
                  const p = BG_PRESETS[key];
                  const active = draft.bg === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBg(key)}
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

            <Section title="Typography">
              <Slider
                label="Base font"
                min={13}
                max={20}
                step={0.5}
                value={draft.typography.baseFontPx}
                display={`${draft.typography.baseFontPx}px`}
                onChange={(v) => setType("baseFontPx", v)}
              />
              <Slider
                label="Letter spacing"
                min={-0.03}
                max={0.12}
                step={0.005}
                value={draft.typography.letterSpacingEm}
                display={`${draft.typography.letterSpacingEm.toFixed(3)}em`}
                onChange={(v) => setType("letterSpacingEm", v)}
              />
            </Section>

            <Section title="Sections (published)">
              <Toggle label="Hero video" checked={draft.toggles.heroVideo} onChange={(v) => setToggle("heroVideo", v)} />
              <Toggle label="Footer" checked={draft.toggles.footer} onChange={(v) => setToggle("footer", v)} />
              <Toggle label="CV nav link" checked={draft.toggles.navCv} onChange={(v) => setToggle("navCv", v)} />
              <Toggle label="Blueprint grid backdrop" checked={draft.toggles.publicGrid} onChange={(v) => setToggle("publicGrid", v)} />
              <Toggle label="Animations" checked={draft.toggles.animations} onChange={(v) => setToggle("animations", v)} />
            </Section>

            <Section title="Debug overlays (local)">
              <Toggle label="Grid overlay" checked={debug.grid} onChange={(v) => setDebugFlag("grid", v)} />
              <Toggle label="Outline elements" checked={debug.outline} onChange={(v) => setDebugFlag("outline", v)} />
              <Toggle label="FPS meter" checked={debug.fps} onChange={(v) => setDebugFlag("fps", v)} />
              <Toggle label="Cursor coordinates" checked={debug.coords} onChange={(v) => setDebugFlag("coords", v)} />
              <Toggle label="Freeze animations" checked={debug.pauseAnim} onChange={(v) => setDebugFlag("pauseAnim", v)} />
            </Section>

            <Section title={`Featured · ${draft.featured.length}`}>
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

            {saveError && <p className="mt-2 text-xs text-red-400">{saveError}</p>}

            {/* publish / discard */}
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={onDiscard}
                disabled={saving || !dirty}
                className="flex-1 rounded-full border border-line px-3 py-2 text-xs text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving || !dirty}
                className="flex-[1.4] rounded-full bg-accent px-3 py-2 text-xs font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Publishing…" : justSaved ? "Saved ✓" : "Publish to everyone"}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onRevert}
                className="flex-1 rounded-full px-3 py-1.5 text-[11px] text-fg-faint transition-colors hover:text-fg-muted"
              >
                Revert edits
              </button>
              <button
                type="button"
                onClick={onResetDefaults}
                className="flex-1 rounded-full px-3 py-1.5 text-[11px] text-fg-faint transition-colors hover:text-fg-muted"
              >
                Load defaults
              </button>
              <button
                type="button"
                onClick={onExit}
                className="flex-1 rounded-full px-3 py-1.5 text-[11px] text-fg-faint transition-colors hover:text-red-400"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono-tight inline-flex items-center gap-2 rounded-full border border-accent/50 bg-bg/85 px-3 py-1.5 text-[10px] uppercase tracking-widest text-accent backdrop-blur transition-colors hover:border-accent hover:bg-bg"
        title={open ? "Close dev console" : "Open dev console"}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-400" : "bg-accent"}`} />
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-fg-muted">
      <span className="flex-shrink-0">{label}</span>
      <span className="flex items-center gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label={`${label} value`}
          className="w-28 rounded border border-line bg-bg px-2 py-1 font-mono-tight text-[10px] text-fg outline-none focus:border-accent"
        />
        <label
          className="relative h-5 w-5 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-line-strong"
          title="Pick colour"
        >
          <span className="absolute inset-0" style={{ background: value }} />
          <input
            type="color"
            value={isHex && value.length !== 4 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} colour picker`}
          />
        </label>
      </span>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="text-xs text-fg-muted">
      <div className="mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono-tight tabular-nums text-fg">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
        aria-label={label}
      />
    </div>
  );
}

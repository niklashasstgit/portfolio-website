/**
 * Site settings — the single JSON document that drives the site's appearance for
 * *every* visitor. Edited from the hidden dev console (see lib/devmode.tsx), saved
 * server-side (see lib/site-settings-store.ts + app/api/site-settings/route.ts), and
 * injected as CSS variables in the root layout so changes are live for everyone,
 * on every device, with no client round-trip.
 *
 * This module is isomorphic — no React, no "server-only", no Node APIs — so it can be
 * imported from the layout (server), the API route (server), and the dev panel (client).
 */

export type BgPresetKey = "void" | "slate" | "blueprint" | "black" | "carbon";

export type SiteSettings = {
  /** Editable colours, applied to the matching --color-* variables. */
  colors: {
    accent: string;
    accent2: string;
    fg: string;
    fgMuted: string;
    fgFaint: string;
    line: string;
    lineStrong: string;
  };
  /** Background palette preset (drives --color-bg / -raised / -raised-2). */
  bg: BgPresetKey;
  typography: {
    /** root font size in px — scales the whole (rem-based) site. */
    baseFontPx: number;
    /** body letter-spacing in em. */
    letterSpacingEm: number;
  };
  /** Public visibility / behaviour toggles — affect all visitors. */
  toggles: {
    heroVideo: boolean;
    footer: boolean;
    navCv: boolean;
    publicGrid: boolean;
    animations: boolean;
  };
  /** Featured project slugs (was localStorage; now shared server-side). */
  featured: string[];
  /** Text content overrides (Phase 2 — present so the shape is stable). */
  content: {
    heroHeadline?: string;
    heroTagline?: string;
  };
};

export const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: "Ember", hex: "#ff6a2c" },
  { name: "Teal", hex: "#52d9c4" },
  { name: "Azure", hex: "#3b82f6" },
  { name: "Violet", hex: "#a855f7" },
  { name: "Lime", hex: "#22c55e" },
  { name: "Rose", hex: "#f43f5e" },
];

export const BG_PRESETS: Record<
  BgPresetKey,
  { name: string; bg: string; raised: string; raised2: string }
> = {
  void: { name: "Void", bg: "#0a0c10", raised: "#10141b", raised2: "#161b24" },
  slate: { name: "Slate", bg: "#0f172a", raised: "#1e293b", raised2: "#334155" },
  blueprint: { name: "Blueprint", bg: "#081826", raised: "#0e2338", raised2: "#143050" },
  black: { name: "Pure Black", bg: "#000000", raised: "#0b0b0b", raised2: "#151515" },
  carbon: { name: "Carbon", bg: "#121212", raised: "#1c1c1c", raised2: "#262626" },
};

export const DEFAULT_SETTINGS: SiteSettings = {
  colors: {
    accent: "#ff6a2c",
    accent2: "#52d9c4",
    fg: "#e8eef6",
    fgMuted: "#93a1b5",
    fgFaint: "#5b6579",
    line: "rgba(232, 238, 246, 0.09)",
    lineStrong: "rgba(232, 238, 246, 0.16)",
  },
  bg: "void",
  typography: {
    baseFontPx: 16,
    letterSpacingEm: 0,
  },
  toggles: {
    heroVideo: true,
    footer: true,
    navCv: true,
    publicGrid: false,
    animations: true,
  },
  featured: [],
  content: {},
};

/* ------------------------------------------------------------------ */
/* Validation — a save can only ever produce known keys with sanitized */
/* values, so the injected <style> can't be used for CSS injection.    */
/* ------------------------------------------------------------------ */

/** Accept a hex colour (#rgb…#rrggbbaa) or an rgb()/rgba() using only numbers. */
const COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(,\s*[\d.]+\s*)?\))$/;

function sanitizeColor(input: unknown, fallback: string): string {
  if (typeof input === "string") {
    const v = input.trim();
    if (v.length <= 32 && COLOR_RE.test(v)) return v;
  }
  return fallback;
}

function clampNum(input: unknown, min: number, max: number, fallback: number): number {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function bool(input: unknown, fallback: boolean): boolean {
  return typeof input === "boolean" ? input : fallback;
}

function optionalText(input: unknown, max = 200): string | undefined {
  if (typeof input !== "string") return undefined;
  const v = input.trim();
  if (!v) return undefined;
  return v.slice(0, max);
}

/**
 * Deep-merge a (partial, untrusted) patch onto a base, whitelisting every key and
 * sanitizing every value. Returns a complete, safe SiteSettings.
 */
export function mergeSettings(
  base: SiteSettings,
  patch: Partial<SiteSettings> | null | undefined
): SiteSettings {
  const p = (patch && typeof patch === "object" ? patch : {}) as Record<string, unknown>;
  const pc = (p.colors && typeof p.colors === "object" ? p.colors : {}) as Record<string, unknown>;
  const pt = (p.typography && typeof p.typography === "object" ? p.typography : {}) as Record<string, unknown>;
  const pg = (p.toggles && typeof p.toggles === "object" ? p.toggles : {}) as Record<string, unknown>;
  const pco = (p.content && typeof p.content === "object" ? p.content : {}) as Record<string, unknown>;

  const bgKey = typeof p.bg === "string" && p.bg in BG_PRESETS ? (p.bg as BgPresetKey) : base.bg;

  const featured = Array.isArray(p.featured)
    ? Array.from(
        new Set(
          p.featured.filter((s): s is string => typeof s === "string" && s.length < 100).slice(0, 200)
        )
      )
    : base.featured;

  return {
    colors: {
      accent: sanitizeColor(pc.accent, base.colors.accent),
      accent2: sanitizeColor(pc.accent2, base.colors.accent2),
      fg: sanitizeColor(pc.fg, base.colors.fg),
      fgMuted: sanitizeColor(pc.fgMuted, base.colors.fgMuted),
      fgFaint: sanitizeColor(pc.fgFaint, base.colors.fgFaint),
      line: sanitizeColor(pc.line, base.colors.line),
      lineStrong: sanitizeColor(pc.lineStrong, base.colors.lineStrong),
    },
    bg: bgKey,
    typography: {
      baseFontPx: clampNum(pt.baseFontPx, 13, 20, base.typography.baseFontPx),
      letterSpacingEm: clampNum(pt.letterSpacingEm, -0.03, 0.12, base.typography.letterSpacingEm),
    },
    toggles: {
      heroVideo: bool(pg.heroVideo, base.toggles.heroVideo),
      footer: bool(pg.footer, base.toggles.footer),
      navCv: bool(pg.navCv, base.toggles.navCv),
      publicGrid: bool(pg.publicGrid, base.toggles.publicGrid),
      animations: bool(pg.animations, base.toggles.animations),
    },
    featured,
    content: {
      heroHeadline: optionalText(pco.heroHeadline, 120) ?? base.content.heroHeadline,
      heroTagline: optionalText(pco.heroTagline, 240) ?? base.content.heroTagline,
    },
  };
}

/**
 * Translate settings into the CSS custom properties that globals.css consumes.
 * The result is injected verbatim into a <style> tag on :root, so keys/values here
 * are the *only* thing that can reach the page — and they've all been sanitized.
 */
export function settingsToCssVars(s: SiteSettings): Record<string, string> {
  const bg = BG_PRESETS[s.bg] ?? BG_PRESETS.void;
  return {
    "--color-accent": s.colors.accent,
    "--color-accent-soft": `color-mix(in srgb, ${s.colors.accent} 14%, transparent)`,
    "--color-accent-2": s.colors.accent2,
    "--color-fg": s.colors.fg,
    "--color-fg-muted": s.colors.fgMuted,
    "--color-fg-faint": s.colors.fgFaint,
    "--color-line": s.colors.line,
    "--color-line-strong": s.colors.lineStrong,
    "--color-bg": bg.bg,
    "--color-bg-raised": bg.raised,
    "--color-bg-raised-2": bg.raised2,
    "--font-size-base": `${s.typography.baseFontPx}px`,
    "--tracking-base": `${s.typography.letterSpacingEm}em`,
  };
}

/** Serialize the CSS vars into a `:root{ … }` string for a <style> tag. */
export function settingsToCssText(s: SiteSettings): string {
  const vars = settingsToCssVars(s);
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `:root{${body}}`;
}

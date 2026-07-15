"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  sectionLabels,
  subsectionLabels,
  academicSubsectionLabels,
  type ProjectSection,
  type PersonalSubsection,
  type AcademicSubsection,
} from "@/content/types";
import type { ProjectOverride } from "@/lib/site-settings";

export type ProjectRow = {
  slug: string;
  title: string;
  /** Static defaults from content/projects-index.ts. */
  section: ProjectSection;
  subsection?: PersonalSubsection;
  academicSubsection?: AcademicSubsection;
};

type Overrides = Record<string, ProjectOverride>;

const SECTIONS = Object.keys(sectionLabels) as ProjectSection[];
const PERSONAL_SUBS = Object.keys(subsectionLabels) as PersonalSubsection[];
const ACADEMIC_SUBS = Object.keys(academicSubsectionLabels) as AcademicSubsection[];

/** Effective (override-applied) view of a row. */
function effective(row: ProjectRow, ov: ProjectOverride | undefined) {
  const section = ov?.section ?? row.section;
  return {
    hidden: ov?.hidden === true,
    section,
    subsection:
      section === "personal"
        ? (ov?.subsection ?? (row.section === "personal" ? row.subsection : undefined))
        : undefined,
    academicSubsection:
      section === "academic"
        ? (ov?.academicSubsection ??
          (row.section === "academic" ? row.academicSubsection : undefined))
        : undefined,
  };
}

/** Reduce a row's effective state to a minimal override (only what differs). */
function toOverride(row: ProjectRow, eff: ReturnType<typeof effective>): ProjectOverride | null {
  const ov: ProjectOverride = {};
  if (eff.hidden) ov.hidden = true;
  if (eff.section !== row.section) ov.section = eff.section;
  if (eff.section === "personal" && eff.subsection !== row.subsection) {
    if (eff.subsection) ov.subsection = eff.subsection;
  }
  if (eff.section === "academic" && eff.academicSubsection !== row.academicSubsection) {
    if (eff.academicSubsection) ov.academicSubsection = eff.academicSubsection;
  }
  return Object.keys(ov).length > 0 ? ov : null;
}

export default function ProjectManager({
  rows,
  initialOverrides,
}: {
  rows: ProjectRow[];
  initialOverrides: Overrides;
}) {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Overrides>(initialOverrides);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const rowBySlug = useMemo(() => {
    const m = new Map<string, ProjectRow>();
    for (const r of rows) m.set(r.slug, r);
    return m;
  }, [rows]);

  const dirty = useMemo(
    () => JSON.stringify(overrides) !== JSON.stringify(initialOverrides),
    [overrides, initialOverrides]
  );

  // Apply a change to one row's effective state → recompute its minimal override.
  const update = (slug: string, patch: Partial<ReturnType<typeof effective>>) => {
    const row = rowBySlug.get(slug)!;
    setOverrides((prev) => {
      const eff = { ...effective(row, prev[slug]), ...patch };
      // Section change resets a now-irrelevant subsection.
      if (patch.section) {
        if (patch.section !== "personal") eff.subsection = undefined;
        if (patch.section !== "academic") eff.academicSubsection = undefined;
      }
      const next = { ...prev };
      const ov = toOverride(row, eff);
      if (ov) next[slug] = ov;
      else delete next[slug];
      return next;
    });
  };

  const resetRow = (slug: string) =>
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectOverrides: overrides }),
      });
      if (res.status === 401) throw new Error("Session expired — log in again.");
      if (!res.ok) throw new Error("Save failed. Try again.");
      const data = (await res.json()) as { projectOverrides: Overrides };
      setOverrides(data.projectOverrides ?? {});
      setSavedTick((t) => t + 1);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = rows.filter((r) => !(overrides[r.slug]?.hidden === true)).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-muted">
          {visibleCount} of {rows.length} projects visible. Toggle visibility or
          re-file a project into a different category; changes publish to every
          visitor on save.
        </p>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {savedTick > 0 && !dirty && !error && (
            <span className="text-xs text-accent">Saved ✓</span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish changes"}
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line bg-bg-raised/50 text-fg-muted">
            <tr className="font-mono-tight text-[10px] uppercase tracking-widest">
              <th className="px-4 py-2.5 font-medium">Visible</th>
              <th className="px-4 py-2.5 font-medium">Project</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Subcategory</th>
              <th className="px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const eff = effective(row, overrides[row.slug]);
              const changed = !!overrides[row.slug];
              return (
                <tr
                  key={row.slug}
                  className={`border-b border-line/60 last:border-b-0 ${
                    eff.hidden ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!eff.hidden}
                      aria-label={`${eff.hidden ? "Show" : "Hide"} ${row.title}`}
                      onClick={() => update(row.slug, { hidden: !eff.hidden })}
                      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                        eff.hidden ? "bg-line-strong" : "bg-accent"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform ${
                          eff.hidden ? "translate-x-0.5" : "translate-x-4"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-fg">{row.title}</span>
                    <span className="ml-2 font-mono-tight text-[10px] text-fg-faint">
                      {row.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={eff.section}
                      onChange={(e) => update(row.slug, { section: e.target.value as ProjectSection })}
                      className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
                    >
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          {sectionLabels[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {eff.section === "personal" && (
                      <select
                        value={eff.subsection ?? ""}
                        onChange={(e) =>
                          update(row.slug, {
                            subsection: (e.target.value || undefined) as PersonalSubsection | undefined,
                          })
                        }
                        className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
                      >
                        <option value="">—</option>
                        {PERSONAL_SUBS.map((s) => (
                          <option key={s} value={s}>
                            {subsectionLabels[s]}
                          </option>
                        ))}
                      </select>
                    )}
                    {eff.section === "academic" && (
                      <select
                        value={eff.academicSubsection ?? ""}
                        onChange={(e) =>
                          update(row.slug, {
                            academicSubsection: (e.target.value || undefined) as
                              | AcademicSubsection
                              | undefined,
                          })
                        }
                        className="rounded-lg border border-line bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
                      >
                        <option value="">—</option>
                        {ACADEMIC_SUBS.map((s) => (
                          <option key={s} value={s}>
                            {academicSubsectionLabels[s]}
                          </option>
                        ))}
                      </select>
                    )}
                    {eff.section === "associations" && (
                      <span className="text-fg-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {changed && (
                      <button
                        type="button"
                        onClick={() => resetRow(row.slug)}
                        className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint transition-colors hover:text-fg-muted"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

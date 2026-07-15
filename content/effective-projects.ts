/**
 * Applies the admin's per-project overrides (from the site-settings document)
 * on top of the static project catalog, producing the lists the public pages
 * actually render.
 *
 * The static definitions in projects-index.ts stay the source of truth; the
 * admin only layers visibility + re-categorization on top. Isomorphic (no React,
 * no server APIs) so it can be called from any server component or route.
 */
import {
  projects,
  cardProjects,
  cardToMeta,
  sortByDate,
} from "./projects-index";
import type { ProjectMeta, ProjectSection } from "./types";
import type { ProjectOverride } from "@/lib/site-settings";

type Overrides = Record<string, ProjectOverride>;

/** Tolerate a missing/legacy overrides map (e.g. settings cached before this
 *  field existed) so a stale document can never crash a public page. */
function norm(overrides: Overrides | undefined | null): Overrides {
  return overrides && typeof overrides === "object" ? overrides : {};
}

/** Apply a single override to a project meta (section/subsection re-filing). */
function withOverride(meta: ProjectMeta, ov: ProjectOverride | undefined): ProjectMeta {
  if (!ov) return meta;
  const next: ProjectMeta = { ...meta };
  if (ov.section) next.section = ov.section;
  // Re-filing across sections: keep whichever subsection field matches the
  // effective section, so a project moved personal→academic doesn't keep a
  // stale personal subsection (and vice-versa).
  if (ov.subsection !== undefined) next.subsection = ov.subsection;
  if (ov.academicSubsection !== undefined) next.academicSubsection = ov.academicSubsection;
  if (next.section !== "personal") next.subsection = undefined;
  if (next.section !== "academic") next.academicSubsection = undefined;
  return next;
}

/** The full unified catalog (heavy projects + CV cards) as ProjectMeta. */
function unifiedCatalog(): ProjectMeta[] {
  return [...projects, ...cardProjects.map(cardToMeta)];
}

/** Is this slug hidden by an override? */
export function isProjectHidden(slug: string, overrides: Overrides | undefined): boolean {
  return norm(overrides)[slug]?.hidden === true;
}

/**
 * Every project visible to the public, with section/subsection overrides applied.
 * Hidden projects are dropped entirely.
 */
export function getVisibleProjects(overrides: Overrides | undefined): ProjectMeta[] {
  const ov = norm(overrides);
  return unifiedCatalog()
    .filter((m) => !ov[m.slug]?.hidden)
    .map((m) => withOverride(m, ov[m.slug]));
}

/** Visible projects for one section, newest-first — what a category row renders. */
export function getVisibleProjectsForSection(
  section: ProjectSection,
  overrides: Overrides | undefined
): ProjectMeta[] {
  return sortByDate(getVisibleProjects(overrides).filter((m) => m.section === section));
}

/** Every slug that has a page but is currently hidden (for 404 + sitemap pruning). */
export function hiddenSlugs(overrides: Overrides | undefined): Set<string> {
  return new Set(
    Object.entries(norm(overrides))
      .filter(([, ov]) => ov.hidden === true)
      .map(([slug]) => slug)
  );
}

import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/fx/Reveal";
import { getVisibleProjectsForSection } from "@/content/effective-projects";
import { readSettings } from "@/lib/site-settings-store";
import {
  ProjectSection,
  ProjectMeta,
  sectionLabels,
  subsectionLabels,
  academicSubsectionLabels,
} from "@/content/types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "All projects by Niklas Blattner, sorted by category — personal builds, academic work, and student associations.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects — Niklas Blattner",
    description:
      "All projects sorted by category — personal builds, academic work, and student associations.",
    url: "/projects",
  },
};

const sectionOrder: ProjectSection[] = ["personal", "academic", "associations"];

const sectionIntros: Record<ProjectSection, string> = {
  personal:
    "Things I build on my own time — RC aircraft and machines in the workshop, software tools at the desk.",
  academic:
    "Thesis work, university projects, and coursework from the University of Stuttgart, EPFL and DHBW Ravensburg.",
  associations:
    "Student engineering teams I've worked on — rockets and satellites, built alongside other students.",
};

/** Ordered subsection buckets per section, matching the nav's anchor scheme. */
const personalSubs = ["rc-projects", "software-projects", "hardware-projects"] as const;
const academicSubs = ["masters", "bachelors"] as const;

type Bucket = { id: string; label: string; items: ProjectMeta[] };

function bucketsFor(section: ProjectSection, items: ProjectMeta[]): Bucket[] {
  if (section === "personal") {
    return personalSubs.map((sub) => ({
      id: `${section}-${sub}`,
      label: subsectionLabels[sub],
      items: items.filter((p) => p.subsection === sub),
    }));
  }
  if (section === "academic") {
    return academicSubs.map((sub) => ({
      id: `${section}-${sub}`,
      label: academicSubsectionLabels[sub],
      items: items.filter((p) => p.academicSubsection === sub),
    }));
  }
  // Associations aren't subdivided — one unlabelled bucket.
  return [{ id: section, label: "", items }];
}

function Grid({ items }: { items: ProjectMeta[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <div data-reveal key={p.slug}>
          <ProjectCard project={p} showFeatured={false} />
        </div>
      ))}
    </div>
  );
}

export default async function ProjectsPage() {
  const { projectOverrides } = await readSettings();

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
        All Projects
      </span>
      <h1 className="text-balance mt-4 max-w-2xl text-4xl font-semibold text-fg sm:text-5xl">
        Project Catalog
      </h1>

      {sectionOrder.map((section) => {
        // Full projects plus the lighter CV cards, all rendered as full cards,
        // with the admin's visibility/re-categorization applied.
        const pageProjects = getVisibleProjectsForSection(section, projectOverrides);
        if (pageProjects.length === 0) return null;

        const buckets = bucketsFor(section, pageProjects).filter((b) => b.items.length > 0);
        const subdivided = buckets.length > 1 || Boolean(buckets[0]?.label);

        return (
          <Reveal key={section}>
            <section id={section} className="mt-20 scroll-mt-28 border-t border-line pt-12">
              <div data-reveal>
                <h2 className="text-2xl font-semibold text-fg sm:text-3xl">
                  {sectionLabels[section]}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-fg-muted sm:text-base">
                  {sectionIntros[section]}
                </p>
              </div>

              {subdivided
                ? buckets.map((b) => (
                    <div key={b.id} id={b.id} className="mt-12 scroll-mt-28">
                      <div data-reveal className="flex items-center gap-3">
                        <h3 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-fg-muted">
                          {b.label}
                        </h3>
                        <div className="h-px flex-1 bg-line" />
                        <span className="font-mono-tight text-xs text-fg-faint">
                          {b.items.length}
                        </span>
                      </div>
                      <Grid items={b.items} />
                    </div>
                  ))
                : <Grid items={pageProjects} />}
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}

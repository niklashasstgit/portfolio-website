import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/fx/Reveal";
import { getVisibleProjectsForSection } from "@/content/effective-projects";
import { readSettings } from "@/lib/site-settings-store";
import { ProjectSection, sectionLabels } from "@/content/types";

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
    "Thesis work, university projects, and coursework from the University of Stuttgart and EPFL.",
  associations:
    "Student engineering teams I've worked on — rockets and satellites, built alongside other students.",
};

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

              {pageProjects.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pageProjects.map((p) => (
                    <div data-reveal key={p.slug}>
                      <ProjectCard project={p} showFeatured={false} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}

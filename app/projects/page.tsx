import type { Metadata } from "next";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/fx/Reveal";
import { cardProjects, projects, CardProject } from "@/content/projects-index";
import {
  ProjectSection,
  sectionLabels,
  subsectionLabels,
  academicSubsectionLabels,
} from "@/content/types";

export const metadata: Metadata = {
  title: "Projects — Niklas Blattner",
  description:
    "All projects sorted by category — personal builds, academic work, and student associations.",
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

function getSubsectionLabel(c: CardProject): string | null {
  if (c.section === "personal" && c.subsection) {
    return subsectionLabels[c.subsection];
  }
  if (c.section === "academic" && c.academicSubsection) {
    return academicSubsectionLabels[c.academicSubsection];
  }
  return null;
}

function SmallCard({ c }: { c: CardProject }) {
  const subsecLabel = getSubsectionLabel(c);

  return (
    <Link
      href={`/projects/${c.slug}`}
      data-reveal
      className="group relative flex flex-col rounded-lg border border-line bg-bg-raised p-5 transition-colors hover:border-line-strong"
    >
      {subsecLabel && (
        <span className="font-mono-tight absolute right-4 top-4 rounded-full border border-line bg-bg/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-fg-muted backdrop-blur">
          {subsecLabel}
        </span>
      )}
      <span className="font-mono-tight text-xs text-fg-faint">{c.year}</span>
      <h4 className="mt-2 text-sm font-semibold leading-snug text-fg group-hover:text-accent">
        {c.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tags.map((t) => (
          <span
            key={t}
            className="font-mono-tight rounded-full border border-line px-2.5 py-0.5 text-[10px] text-fg-faint"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
        All Projects
      </span>
      <h1 className="text-balance mt-4 max-w-2xl text-4xl font-semibold text-fg sm:text-5xl">
        Project Catalog
      </h1>

      {sectionOrder.map((section) => {
        const pageProjects = projects.filter((p) => p.section === section);
        const smallCards = cardProjects.filter((c) => c.section === section);

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
                      <ProjectCard project={p} />
                    </div>
                  ))}
                </div>
              )}
              {smallCards.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {smallCards.map((c) => (
                    <SmallCard key={c.title} c={c} />
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

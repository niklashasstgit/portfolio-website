import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import StaticFireHero from "@/components/home/StaticFireHero";
import CategoryRow from "@/components/home/CategoryRow";
import { getVisibleProjectsForSection } from "@/content/effective-projects";
import { readSettings } from "@/lib/site-settings-store";
import { sectionLabels, ProjectSection } from "@/content/types";

const sectionOrder: ProjectSection[] = ["personal", "academic", "associations"];

export default async function Home() {
  const { projectOverrides } = await readSettings();
  return (
    <div>
      {/* Hero — animated static-fire scene */}
      <StaticFireHero>
        <p className="text-balance mt-6 max-w-2xl text-base text-fg-muted sm:text-lg">
          M.Sc. Aerospace Engineering graduate of the University of Stuttgart. My work spans
          air- and spacecraft structures, rocket propulsion, computer science, data science
          and machine learning, and a decade of hands-on builds. This site walks through the
          actual process of designing, simulating, building, testing and optimizing to
          realize various projects.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#projects"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            See the projects
          </a>
          <Link
            href="/cv"
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-fg backdrop-blur transition-colors hover:border-line-strong"
          >
            View CV
          </Link>
        </div>
      </StaticFireHero>


      {/* Categories */}
      <section id="projects" className="border-t border-line bg-bg-raised/40">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <div data-reveal>
              <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
                By Category
              </span>
              <h2 className="text-balance mt-3 max-w-xl text-3xl font-semibold text-fg sm:text-4xl">
                Project Catalog
              </h2>
            </div>
          </Reveal>
          {sectionOrder.map((section) => {
            // Every project in this section — the full ones plus the lighter
            // CV cards — with the admin's visibility/re-categorization applied.
            const sectionProjects = getVisibleProjectsForSection(section, projectOverrides);
            if (sectionProjects.length === 0) return null;
            return (
              <Reveal key={section}>
                <div data-reveal className="mt-12 flex items-center gap-3">
                  <h3 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-fg-muted">
                    {sectionLabels[section]}
                  </h3>
                  <div className="h-px flex-1 bg-line" />
                  <span className="font-mono-tight text-xs text-fg-faint">
                    {sectionProjects.length} projects
                  </span>
                </div>
                <CategoryRow projects={sectionProjects} />
              </Reveal>
            );
          })}
          <div className="mt-10">
            <Link href="/projects" className="text-sm text-accent hover:underline">
              View every project, including the smaller ones from the CV →
            </Link>
          </div>
        </div>
      </section>

      {/* Who I am strip */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div data-reveal>
              <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
                Who I Am
              </span>
              <h2 className="text-balance mt-3 text-3xl font-semibold text-fg sm:text-4xl">
                Aerospace by training, hands-on by habit
              </h2>
            </div>
            <div data-reveal className="space-y-4 text-fg-muted">
              <p>
                I recently completed my M.Sc. in Aerospace Engineering at the University of
                Stuttgart, finishing with a thesis at Airbus Defence and Space. Before that: two
                years as a working student and development engineer at Diehl Defence on solid
                rocket motors and jet-engine CFD, and a semester at EPFL working on cubesat
                structures.
              </p>
              <p>
                Outside of coursework and work, I build things end to end — from a computer-vision
                aircraft tracker running on two phone cameras, to RC aircraft and a from-scratch VTOL
                UAV, to a 3D-printed CNC machine I redesigned to hold real tolerance. I like the part
                of engineering where a plan meets a workshop and turns out to be wrong in an
                interesting way.
              </p>
              <Link href="/cv" className="inline-block text-sm text-accent hover:underline">
                Full CV, employment history & education →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import SimViewer from "@/components/three/SimViewer";
import { visualSkyRadarChapters } from "@/content/visual-sky-radar";
import { projects } from "@/content/projects-index";

const meta = projects.find((p) => p.slug === "visual-sky-radar")!;

export const metadata: Metadata = {
  title: `${meta.title} — Niklas Blattner`,
  description: meta.summary,
};

export default function Page() {
  return (
    <>
      <ProjectHero
        kicker="Personal Project · Software · Computer Vision"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
      />
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20">
        <span className="font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">
          The Simulation Environment
        </span>
        <h2 className="text-balance mt-3 max-w-xl text-2xl font-semibold text-fg sm:text-3xl">
          Two cameras, one shared patch of sky
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-fg-muted sm:text-base">
          Every detection and triangulation is validated in a simulated 3D environment before it
          runs on real hardware: ground cameras with known positions and orientations watch
          simulated aircraft cross their overlapping fields of view. Drag the model to look
          around.
        </p>
        <div className="mt-8">
          <SimViewer />
        </div>
      </section>
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={visualSkyRadarChapters} />
      </div>
    </>
  );
}

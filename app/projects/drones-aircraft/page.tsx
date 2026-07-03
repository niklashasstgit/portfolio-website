import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { dronesAircraftChapters } from "@/content/drones-aircraft";
import { projects } from "@/content/projects-index";

const meta = projects.find((p) => p.slug === "drones-aircraft")!;

export const metadata: Metadata = {
  title: `${meta.title} — Niklas Blattner`,
  description: meta.summary,
};

export default function Page() {
  return (
    <>
      <ProjectHero
        kicker="Personal Project · RC & Hands-on Engineering"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={dronesAircraftChapters} />
      </div>
    </>
  );
}

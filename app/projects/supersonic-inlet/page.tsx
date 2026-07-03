import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { supersonicInletChapters } from "@/content/supersonic-inlet";
import { projects } from "@/content/projects-index";

const meta = projects.find((p) => p.slug === "supersonic-inlet")!;

export const metadata: Metadata = {
  title: `${meta.title} — Niklas Blattner`,
  description: meta.summary,
};

export default function Page() {
  return (
    <>
      <ProjectHero
        kicker="Academic · Bachelor Thesis · Diehl Defence"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={supersonicInletChapters} />
      </div>
    </>
  );
}

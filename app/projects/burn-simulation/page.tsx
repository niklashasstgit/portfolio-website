import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { burnSimulationChapters } from "@/content/burn-simulation";
import { projects } from "@/content/projects-index";

const meta = projects.find((p) => p.slug === "burn-simulation")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.summary,
  keywords: meta.tags,
  alternates: { canonical: `/projects/${meta.slug}` },
  openGraph: { title: meta.title, description: meta.summary, url: `/projects/${meta.slug}`, images: [meta.cover] },
};

export default function Page() {
  return (
    <>
      <ProjectHero
        kicker="Academic · Project Thesis · Diehl Defence"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={burnSimulationChapters} />
      </div>
    </>
  );
}

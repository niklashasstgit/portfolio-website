import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { epflSpacecraftChapters } from "@/content/epfl-spacecraft";
import { projects } from "@/content/projects-index";

const meta = projects.find((p) => p.slug === "epfl-spacecraft")!;

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
        kicker="Student Association · EPFL"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
        status="category"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={epflSpacecraftChapters} />
      </div>
    </>
  );
}

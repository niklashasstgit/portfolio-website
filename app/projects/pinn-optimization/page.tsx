import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { pinnOptimizationChapters } from "@/content/pinn-optimization";
import { projects } from "@/content/projects-index";
import { guardProjectVisible } from "@/lib/project-visibility";

const meta = projects.find((p) => p.slug === "pinn-optimization")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.summary,
  keywords: meta.tags,
  alternates: { canonical: `/projects/${meta.slug}` },
  openGraph: { title: meta.title, description: meta.summary, url: `/projects/${meta.slug}`, images: [meta.cover] },
};

export default async function Page() {
  await guardProjectVisible("pinn-optimization");

  return (
    <>
      <ProjectHero
        kicker="Academic Project · University of Stuttgart"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={pinnOptimizationChapters} />
      </div>
    </>
  );
}

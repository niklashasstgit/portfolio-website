import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { cfdFrameworkChapters } from "@/content/cfd-framework";
import { cardProjects, GENERIC_PLACEHOLDER } from "@/content/projects-index";

const meta = cardProjects.find((p) => p.slug === "cfd-framework")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.summary,
  keywords: meta.tags,
  alternates: { canonical: `/projects/${meta.slug}` },
  openGraph: {
    title: meta.title,
    description: meta.summary,
    url: `/projects/${meta.slug}`,
    images: [meta.cover ?? GENERIC_PLACEHOLDER],
  },
};

export default function Page() {
  return (
    <>
      <ProjectHero
        kicker="Personal Project · Software"
        title={meta.title}
        tagline={meta.summary}
        year={meta.year}
        tags={meta.tags}
        cover="/images/cfd-framework/cover.png"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={cfdFrameworkChapters} />
      </div>
    </>
  );
}

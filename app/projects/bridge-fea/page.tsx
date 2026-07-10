import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { bridgeFeaChapters } from "@/content/bridge-fea";
import { cardProjects, GENERIC_PLACEHOLDER } from "@/content/projects-index";

const meta = cardProjects.find((p) => p.slug === "bridge-fea")!;

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
        kicker="Academic Project · University of Stuttgart"
        title={meta.title}
        tagline={meta.summary}
        year={meta.year}
        tags={meta.tags}
        cover="/images/bridge-fea/cover.jpg"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={bridgeFeaChapters} />
      </div>
    </>
  );
}

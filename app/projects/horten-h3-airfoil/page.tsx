import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { hortenH3Chapters } from "@/content/horten-h3-airfoil";
import { cardProjects, GENERIC_PLACEHOLDER } from "@/content/projects-index";
import { guardProjectVisible } from "@/lib/project-visibility";

const meta = cardProjects.find((p) => p.slug === "horten-h3-airfoil")!;

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

export default async function Page() {
  await guardProjectVisible("horten-h3-airfoil");

  return (
    <>
      <ProjectHero
        kicker="Academic Project · University of Stuttgart"
        title={meta.title}
        tagline={meta.summary}
        year={meta.year}
        tags={meta.tags}
        cover="/images/horten-h3-airfoil/cover.jpg"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={hortenH3Chapters} />
      </div>
    </>
  );
}

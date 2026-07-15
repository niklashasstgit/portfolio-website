import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { investmentPlatformChapters } from "@/content/investment-platform";
import { cardProjects, GENERIC_PLACEHOLDER } from "@/content/projects-index";
import { guardProjectVisible } from "@/lib/project-visibility";

const meta = cardProjects.find((p) => p.slug === "investment-platform")!;

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
  await guardProjectVisible("investment-platform");

  return (
    <>
      <ProjectHero
        kicker="Personal Project · Software"
        title={meta.title}
        tagline={meta.summary}
        year={meta.year}
        tags={meta.tags}
        cover="/images/investment-platform/cover.png"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={investmentPlatformChapters} />
      </div>
    </>
  );
}

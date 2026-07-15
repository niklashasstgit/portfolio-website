import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { hyendRocketChapters } from "@/content/hyend-rocket";
import { projects } from "@/content/projects-index";
import { guardProjectVisible } from "@/lib/project-visibility";

const meta = projects.find((p) => p.slug === "hyend-rocket")!;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.summary,
  keywords: meta.tags,
  alternates: { canonical: `/projects/${meta.slug}` },
  openGraph: { title: meta.title, description: meta.summary, url: `/projects/${meta.slug}`, images: [meta.cover] },
};

export default async function Page() {
  await guardProjectVisible("hyend-rocket");

  return (
    <>
      <ProjectHero
        kicker="Student Association · HyEnD"
        title={meta.title}
        tagline={meta.tagline}
        year={meta.year}
        tags={meta.tags}
        cover={meta.cover}
        status="placeholder"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={hyendRocketChapters} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { placeholderProjects } from "@/content/placeholder-projects";

export async function generateStaticParams() {
  return placeholderProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = placeholderProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    keywords: project.tags,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `/projects/${slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = placeholderProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <ProjectHero
        kicker={project.kicker}
        title={project.title}
        tagline={project.tagline}
        year={project.year}
        tags={project.tags}
        status="placeholder"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={project.chapters} />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import ScrollStory from "@/components/scrollstory/ScrollStory";
import { verificationDeviceChapters } from "@/content/verification-device";
import { cardProjects, GENERIC_PLACEHOLDER } from "@/content/projects-index";
import { guardProjectVisible } from "@/lib/project-visibility";

const meta = cardProjects.find((p) => p.slug === "verification-device")!;

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
  await guardProjectVisible("verification-device");

  return (
    <>
      <ProjectHero
        kicker="Academic Project · Diehl Defence / DHBW"
        title={meta.title}
        tagline={meta.summary}
        year={meta.year}
        tags={meta.tags}
        cover="/images/verification-device/cover.jpg"
      />
      <div className="py-6 sm:py-10">
        <ScrollStory chapters={verificationDeviceChapters} />
      </div>
    </>
  );
}

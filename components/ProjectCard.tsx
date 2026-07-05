import Image from "next/image";
import Link from "next/link";
import { ProjectMeta, subsectionLabels, academicSubsectionLabels } from "@/content/types";
import CardFeatureOverlay from "@/components/CardFeatureOverlay";

function getSubsectionLabel(project: ProjectMeta): string | null {
  if (project.section === "personal" && project.subsection) {
    return subsectionLabels[project.subsection];
  }
  if (project.section === "academic" && project.academicSubsection) {
    return academicSubsectionLabels[project.academicSubsection];
  }
  return null;
}

export default function ProjectCard({
  project,
  size = "md",
  showFeatured = true,
}: {
  project: ProjectMeta;
  size?: "lg" | "md";
  /** Render the featured overlay (dev star toggle / "Featured" bubble). */
  showFeatured?: boolean;
}) {
  return (
    <Link
      href={project.href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-bg-raised transition-colors hover:border-line-strong"
    >
      <div
        className={`relative overflow-hidden border-b border-line bg-bg-raised-2 ${
          size === "lg" ? "aspect-[16/10]" : "aspect-[16/10]"
        }`}
      >
        {project.cover ? (
          <Image
            src={project.cover}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 480px, 100vw"
          />
        ) : (
          <div className="bp-grid absolute inset-0 opacity-[0.08]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-raised via-transparent to-transparent" />
        {getSubsectionLabel(project) && (
          <span className="font-mono-tight absolute left-4 top-4 rounded-full border border-line bg-bg/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-fg-muted backdrop-blur">
            {getSubsectionLabel(project)}
          </span>
        )}
        {showFeatured && <CardFeatureOverlay slug={project.slug} />}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono-tight text-xs text-fg-faint">{project.category}</span>
          <span className="font-mono-tight text-xs text-fg-faint">{project.year}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-fg group-hover:text-accent sm:text-xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">{project.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="font-mono-tight rounded-full border border-line px-2.5 py-0.5 text-[10px] text-fg-faint"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

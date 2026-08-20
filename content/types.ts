export type MediaItem = {
  type: "image" | "video";
  src: string;
  alt: string;
  caption?: string;
  /** object-fit hint for the frame */
  fit?: "cover" | "contain";
};

export type ChapterLayout =
  | "image-right"
  | "image-left"
  | "gallery"
  | "full-bleed"
  | "diagram"
  | "text-only";

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  media?: MediaItem[];
  layout?: ChapterLayout;
  tags?: string[];
  /** optional custom diagram component key, rendered instead of media */
  diagram?: "camera-fov" | "calibration-wall";
};

export type ProjectStatus = "flagship" | "category" | "card" | "placeholder";

/** An outbound link offered on a project page — source, write-up or demo. */
export type ProjectLink = {
  label: string;
  href: string;
  kind?: "repo" | "report" | "demo" | "site";
};

/**
 * Provenance note for work carried out inside a company. Rendered as a banner
 * on the project page so it is unmissable: everything shown is drawn from an
 * already-published document, not from internal material.
 */
export type ProjectDisclaimer = {
  /** Company the work was carried out at. */
  org: string;
  /** The already-published document the page draws on. */
  source: string;
};

/** The standard wording used for every company-work disclaimer. */
export function disclaimerText(d: ProjectDisclaimer): string {
  return (
    `This work was carried out at ${d.org}. Everything on this page is public: it is drawn ` +
    `entirely from ${d.source}. No confidential, proprietary or export-restricted material is ` +
    `shown, and the figures are limited to those cleared in that publication.`
  );
}

/** Top-level portfolio sections */
export type ProjectSection = "personal" | "academic" | "associations";

/** Subsections within personal projects */
export type PersonalSubsection =
  | "rc-projects"
  | "software-projects"
  | "hardware-projects";

/** Subsections within academic projects */
export type AcademicSubsection = "masters" | "bachelors";

export const sectionLabels: Record<ProjectSection, string> = {
  personal: "Personal",
  academic: "Academic",
  associations: "Student Association",
};

export const subsectionLabels: Record<PersonalSubsection, string> = {
  "rc-projects": "RC-Projects",
  "software-projects": "Coding-Projects",
  "hardware-projects": "Hardware-Projects",
};

export const academicSubsectionLabels: Record<AcademicSubsection, string> = {
  masters: "Masters",
  bachelors: "Bachelors",
};

export type ProjectMeta = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  tags: string[];
  cover: string;
  summary: string;
  status: ProjectStatus;
  href: string;
  section: ProjectSection;
  subsection?: PersonalSubsection;
  academicSubsection?: AcademicSubsection;
  /** Your part in it — omitted for solo personal projects. */
  role?: string;
  /** How long it actually ran ("one week", "5 months"). */
  duration?: string;
  /** Team context ("solo", "20-person team", "structures pole of ~40"). */
  team?: string;
  /** The tools that actually did the work — shown in the hero spec block. */
  tools?: string[];
  /** Source, report or demo links. */
  links?: ProjectLink[];
  /** Company-work provenance banner. */
  disclaimer?: ProjectDisclaimer;
};

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
};

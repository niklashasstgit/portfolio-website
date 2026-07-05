import { projects, cardProjects } from "@/content/projects-index";

/** Single source of truth for the deployed URL — update here if the domain changes. */
export const siteUrl = "https://niklasjulianblattner.com";

export const siteName = "Niklas Blattner";
export const fullName = "Niklas Julian Blattner";

export const siteDescription =
  "Portfolio of Niklas Julian Blattner: aerospace engineering projects spanning computer vision aircraft tracking, spacecraft thermal modeling, propulsion, aerodynamics, and hands-on builds.";

/** Aggregated tags from every project — doubles as the topic keyword list. */
const topicKeywords = Array.from(
  new Set([...projects, ...cardProjects].flatMap((p) => p.tags))
);

export const siteKeywords = [
  "Niklas Blattner",
  "Niklas Julian Blattner",
  "Niklas Blattner aerospace engineer",
  "Aerospace Engineer",
  "University of Stuttgart",
  "Airbus Defence and Space",
  "Diehl Defence",
  "EPFL",
  ...topicKeywords,
];

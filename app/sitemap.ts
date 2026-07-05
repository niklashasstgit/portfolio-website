import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";
import { projects, cardProjects } from "@/content/projects-index";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectSlugs = new Set([
    ...projects.map((p) => p.slug),
    ...cardProjects.map((p) => p.slug),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/cv`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = Array.from(projectSlugs).map((slug) => ({
    url: `${siteUrl}/projects/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}

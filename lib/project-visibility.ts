// NOTE: server-only (reads the settings store). Shared guard for the dedicated
// per-project pages under app/projects/<slug>/. Each project has its own static
// page, so the admin's "hidden" toggle is enforced here — a hidden project's
// page 404s on direct visit, matching its removal from the listings + sitemap.
import { notFound } from "next/navigation";
import { readSettings } from "@/lib/site-settings-store";
import { isProjectHidden } from "@/content/effective-projects";

export async function guardProjectVisible(slug: string): Promise<void> {
  const { projectOverrides } = await readSettings();
  if (isProjectHidden(slug, projectOverrides)) notFound();
}

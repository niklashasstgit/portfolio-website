import { projects, cardProjects } from "@/content/projects-index";
import { readSettings } from "@/lib/site-settings-store";
import ProjectManager, { type ProjectRow } from "@/components/admin/ProjectManager";

export const dynamic = "force-dynamic";

/** Unified list of every project (heavy + CV cards) with its static defaults. */
function projectRows(): ProjectRow[] {
  const rows: ProjectRow[] = [
    ...projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      section: p.section,
      subsection: p.subsection,
      academicSubsection: p.academicSubsection,
    })),
    ...cardProjects.map((c) => ({
      slug: c.slug,
      title: c.title,
      section: c.section,
      subsection: c.subsection,
      academicSubsection: c.academicSubsection,
    })),
  ];
  return rows.sort((a, b) => a.title.localeCompare(b.title));
}

export default async function AdminProjectsPage() {
  const { projectOverrides } = await readSettings();
  return (
    <div>
      <h2 className="text-lg font-semibold text-fg">Projects</h2>
      <div className="mt-4">
        <ProjectManager rows={projectRows()} initialOverrides={projectOverrides ?? {}} />
      </div>
    </div>
  );
}

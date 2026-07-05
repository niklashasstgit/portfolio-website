"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { projects } from "@/content/projects-index";
import { sectionLabels, subsectionLabels, academicSubsectionLabels, ProjectSection } from "@/content/types";
import { useDevMode } from "@/lib/devmode";

const navSections: ProjectSection[] = ["personal", "academic", "associations"];
const projectGroups = navSections.map((section) => {
  const sectionProjects = projects.filter((p) => p.section === section);

  if (section === "personal") {
    // Group personal projects by subsection (show all subsections even if only cardProjects)
    const subsections = ["rc-projects", "software-projects", "hardware-projects"] as const;
    const grouped = subsections.map((sub) => ({
      subsection: sub,
      label: subsectionLabels[sub],
      items: sectionProjects.filter((p) => p.subsection === sub),
    }));

    return {
      section,
      label: sectionLabels[section],
      subsections: grouped,
      items: [] as typeof sectionProjects,
    };
  }

  if (section === "academic") {
    // Get unique academic subsections
    const academicSubs = new Set(sectionProjects.map((p) => p.academicSubsection).filter(Boolean));
    const grouped = Array.from(academicSubs)
      .map((sub) => ({
        subsection: sub,
        label: academicSubsectionLabels[sub as keyof typeof academicSubsectionLabels],
      }));

    return {
      section,
      label: sectionLabels[section],
      subsections: grouped,
      items: sectionProjects,
    };
  }

  return {
    section,
    label: sectionLabels[section],
    subsections: undefined,
    items: sectionProjects,
  };
});

export default function Nav() {
  const pathname = usePathname();
  const { registerLogoClick } = useDevMode();
  const [open, setOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on navigation — state adjustment during render instead of an
  // effect, per react-hooks/set-state-in-effect
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
    setProjectsOpen(false);
  }

  const isProjects = pathname?.startsWith("/projects");

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "bg-bg/85 backdrop-blur border-line"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          onClick={registerLogoClick}
          className="font-mono-tight text-sm tracking-widest text-fg hover:text-accent transition-colors"
        >
          N. BLATTNER
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className={`text-sm transition-colors hover:text-fg ${
              pathname === "/" ? "text-fg" : "text-fg-muted"
            }`}
          >
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setProjectsOpen(true)}
            onMouseLeave={() => setProjectsOpen(false)}
          >
            <Link
              href="/#projects"
              className={`text-sm transition-colors hover:text-fg ${
                pathname === "/" ? "text-fg" : "text-fg-muted"
              }`}
            >
              Projects
            </Link>
            {projectsOpen && (
              <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3">
                <div className="rounded-lg border border-line bg-bg-raised p-3 shadow-2xl shadow-black/40">
                  {projectGroups.map((g) => (
                    <div key={g.section}>
                      <a
                        href={`/#projects`}
                        onClick={() => setProjectsOpen(false)}
                        className="block px-3 py-1.5 font-mono-tight text-[10px] uppercase tracking-widest text-fg hover:text-accent"
                      >
                        {g.label}
                      </a>
                      {g.subsections && (
                        g.subsections.map((sub) => (
                          <a
                            key={sub.subsection || sub.label}
                            href={`/#projects`}
                            onClick={() => setProjectsOpen(false)}
                            className="block px-6 py-1 font-mono-tight text-[9px] uppercase tracking-widest text-fg-faint hover:text-accent"
                          >
                            {sub.label}
                          </a>
                        ))
                      )}
                    </div>
                  ))}
                  <a
                    href={`/projects`}
                    onClick={() => setProjectsOpen(false)}
                    className="mt-2 block border-t border-line px-3 py-2 font-mono-tight text-[10px] uppercase tracking-widest text-accent hover:text-fg transition-colors"
                  >
                    See all projects →
                  </a>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/cv"
            className={`text-sm transition-colors hover:text-fg ${
              pathname === "/cv" ? "text-fg" : "text-fg-muted"
            }`}
          >
            CV
          </Link>
        </nav>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="font-mono-tight text-xs text-fg">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-bg px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/" className="rounded-md px-2 py-2 text-sm text-fg-muted hover:text-fg">
              Home
            </Link>
            {projectGroups.map((g) => (
              <div key={g.section} className="flex flex-col gap-0.5">
                <a
                  href="/#projects"
                  onClick={() => setOpen(false)}
                  className="mt-2 block px-2 py-1.5 font-mono-tight text-[10px] uppercase tracking-widest text-fg hover:text-accent"
                >
                  {g.label}
                </a>
                {g.subsections && (
                  g.subsections.map((sub) => (
                    <a
                      key={sub.subsection || sub.label}
                      href="/#projects"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-1 font-mono-tight text-[9px] uppercase tracking-widest text-fg-faint hover:text-accent"
                    >
                      {sub.label}
                    </a>
                  ))
                )}
              </div>
            ))}
            <Link href="/projects" className="mt-2 border-t border-line px-2 py-2 font-mono-tight text-[10px] uppercase tracking-widest text-accent hover:text-fg transition-colors" onClick={() => setOpen(false)}>
              See all projects →
            </Link>
            <Link href="/cv" className="mt-2 rounded-md px-2 py-2 text-sm text-fg-muted hover:text-fg border-t border-line">
              CV
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

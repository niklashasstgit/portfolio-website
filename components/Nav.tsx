"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getVisibleProjects } from "@/content/effective-projects";
import {
  sectionLabels,
  subsectionLabels,
  academicSubsectionLabels,
  ProjectSection,
} from "@/content/types";
import type { ProjectOverride } from "@/lib/site-settings";
import { useDevMode } from "@/lib/devmode";

const navSections: ProjectSection[] = ["personal", "academic", "associations"];

const personalSubs = ["rc-projects", "software-projects", "hardware-projects"] as const;
const academicSubs = ["masters", "bachelors"] as const;

type NavSub = { key: string; label: string; href: string; count: number };
type NavGroup = { section: ProjectSection; label: string; href: string; subsections: NavSub[] };

/**
 * Build the menu from the same override-aware, unified catalog the public pages
 * render — so every project appears, hidden ones don't, and each entry links to
 * the section it actually belongs to.
 */
function buildGroups(overrides: Record<string, ProjectOverride> | undefined): NavGroup[] {
  const visible = getVisibleProjects(overrides);

  return navSections.map((section) => {
    const inSection = visible.filter((p) => p.section === section);
    const href = `/projects#${section}`;
    let subsections: NavSub[] = [];

    if (section === "personal") {
      subsections = personalSubs.map((sub) => ({
        key: sub,
        label: subsectionLabels[sub],
        href: `/projects#${section}-${sub}`,
        count: inSection.filter((p) => p.subsection === sub).length,
      }));
    } else if (section === "academic") {
      subsections = academicSubs.map((sub) => ({
        key: sub,
        label: academicSubsectionLabels[sub],
        href: `/projects#${section}-${sub}`,
        count: inSection.filter((p) => p.academicSubsection === sub).length,
      }));
    }

    return {
      section,
      label: sectionLabels[section],
      href,
      // Never advertise an empty drawer.
      subsections: subsections.filter((s) => s.count > 0),
    };
  });
}

export default function Nav({
  projectOverrides,
}: {
  projectOverrides?: Record<string, ProjectOverride>;
}) {
  const projectGroups = buildGroups(projectOverrides);
  const pathname = usePathname();
  const { registerLogoClick, toggles } = useDevMode();
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
                      <Link
                        href={g.href}
                        onClick={() => setProjectsOpen(false)}
                        className="block px-3 py-1.5 font-mono-tight text-[10px] uppercase tracking-widest text-fg hover:text-accent"
                      >
                        {g.label}
                      </Link>
                      {g.subsections.map((sub) => (
                        <Link
                          key={sub.key}
                          href={sub.href}
                          onClick={() => setProjectsOpen(false)}
                          className="flex items-center justify-between gap-3 px-6 py-1 font-mono-tight text-[9px] uppercase tracking-widest text-fg-faint hover:text-accent"
                        >
                          <span>{sub.label}</span>
                          <span className="text-fg-faint/70">{sub.count}</span>
                        </Link>
                      ))}
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

          {toggles.navCv && (
            <Link
              href="/cv"
              className={`text-sm transition-colors hover:text-fg ${
                pathname === "/cv" ? "text-fg" : "text-fg-muted"
              }`}
            >
              CV
            </Link>
          )}
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
                <Link
                  href={g.href}
                  onClick={() => setOpen(false)}
                  className="mt-2 block px-2 py-1.5 font-mono-tight text-[10px] uppercase tracking-widest text-fg hover:text-accent"
                >
                  {g.label}
                </Link>
                {g.subsections.map((sub) => (
                  <Link
                    key={sub.key}
                    href={sub.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-1 font-mono-tight text-[9px] uppercase tracking-widest text-fg-faint hover:text-accent"
                  >
                    <span>{sub.label}</span>
                    <span className="text-fg-faint/70">{sub.count}</span>
                  </Link>
                ))}
              </div>
            ))}
            <Link href="/projects" className="mt-2 border-t border-line px-2 py-2 font-mono-tight text-[10px] uppercase tracking-widest text-accent hover:text-fg transition-colors" onClick={() => setOpen(false)}>
              See all projects →
            </Link>
            {toggles.navCv && (
              <Link href="/cv" className="mt-2 rounded-md px-2 py-2 text-sm text-fg-muted hover:text-fg border-t border-line">
                CV
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

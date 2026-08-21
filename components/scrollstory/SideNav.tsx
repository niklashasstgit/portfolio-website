"use client";

import { useEffect, useRef } from "react";
import { Chapter } from "@/content/types";

export default function SideNav({
  chapters,
  activeId,
  progress,
}: {
  chapters: Chapter[];
  activeId: string;
  progress: number;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * Keep the active chapter near the middle of the rail.
   *
   * Long stories (the airfoil code and verification device both run to 17
   * chapters) overflow the sticky column, so the rail scrolls on its own. This
   * adjusts only the rail's own scrollTop — never scrollIntoView, which would
   * drag the page along with it.
   */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    // Nothing to do while the whole list fits.
    if (rail.scrollHeight <= rail.clientHeight + 1) return;

    const item = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-nav-id]")
    ).find((el) => el.dataset.navId === activeId);
    if (!item) return;

    const railBox = rail.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    const delta =
      itemBox.top + itemBox.height / 2 - (railBox.top + railBox.height / 2);

    // Already close enough to centre — don't nudge it on every chapter change.
    if (Math.abs(delta) < 24) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({
      top: rail.scrollTop + delta,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeId]);

  return (
    <nav className="hidden lg:block" aria-label="Chapters">
      <div className="sticky top-28">
        <div
          ref={railRef}
          className="thin-scrollbar relative max-h-[calc(100vh-11rem)] overflow-y-auto overscroll-contain pr-2"
        >
          <div className="relative pl-6">
            <div className="absolute left-[3px] top-1 bottom-1 w-px bg-line" />
            <div
              className="absolute left-[3px] top-1 w-px bg-accent transition-[height] duration-200 ease-out"
              style={{ height: `${Math.min(100, Math.max(0, progress))}%` }}
            />
            <ul className="space-y-6">
              {chapters.map((c, i) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id} data-nav-id={c.id} className="relative">
                    <span
                      className={`absolute -left-6 top-1 h-1.5 w-1.5 rounded-full transition-colors ${
                        active ? "bg-accent" : "bg-fg-faint"
                      }`}
                    />
                    <button
                      onClick={() => scrollTo(c.id)}
                      aria-current={active ? "true" : undefined}
                      className="block rounded-sm text-left"
                    >
                      <span
                        className={`font-mono-tight block text-[10px] tracking-widest ${
                          active ? "text-accent" : "text-fg-faint"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`mt-0.5 block text-sm leading-snug transition-colors ${
                          active ? "text-fg" : "text-fg-muted hover:text-fg"
                        }`}
                      >
                        {c.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

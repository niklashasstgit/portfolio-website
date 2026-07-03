"use client";

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
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="hidden lg:block" aria-label="Chapters">
      <div className="sticky top-28">
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
                <li key={c.id} className="relative">
                  <span
                    className={`absolute -left-6 top-1 h-1.5 w-1.5 rounded-full transition-colors ${
                      active ? "bg-accent" : "bg-fg-faint"
                    }`}
                  />
                  <button
                    onClick={() => scrollTo(c.id)}
                    className="block text-left"
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
    </nav>
  );
}

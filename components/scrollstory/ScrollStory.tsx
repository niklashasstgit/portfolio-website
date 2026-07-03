"use client";

import { useEffect, useRef, useState } from "react";
import { Chapter } from "@/content/types";
import ChapterSection from "./ChapterSection";
import SideNav from "./SideNav";

export default function ScrollStory({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: [0, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters.length]);

  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeId)
  );
  const progress =
    chapters.length > 1 ? (activeIndex / (chapters.length - 1)) * 100 : 100;

  return (
    <div ref={containerRef} className="mx-auto max-w-6xl px-5 sm:px-8">
      {/* mobile chapter strip */}
      <div className="sticky top-[57px] z-30 -mx-5 mb-2 border-b border-line bg-bg/90 px-5 py-2.5 backdrop-blur sm:-mx-8 sm:px-8 lg:hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              onClick={() =>
                document
                  .getElementById(c.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className={`font-mono-tight shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                c.id === activeId
                  ? "border-accent text-accent"
                  : "border-line text-fg-faint"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <SideNav chapters={chapters} activeId={activeId} progress={progress} />
        <div>
          {chapters.map((c, i) => (
            <ChapterSection key={c.id} chapter={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

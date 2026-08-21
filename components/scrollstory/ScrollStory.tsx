"use client";

import { useEffect, useRef, useState } from "react";
import { Chapter } from "@/content/types";
import ChapterSection from "./ChapterSection";
import SideNav from "./SideNav";

/** Fraction of the viewport height used as the "you are here" line. */
const ACTIVE_LINE = 0.32;

export default function ScrollStory({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  /**
   * Track the active chapter against a fixed line near the top of the viewport.
   *
   * This replaces an IntersectionObserver with asymmetric root margins, which
   * left the final chapter unreachable: a short last section never entered the
   * observed band, so the rail stayed stuck on the second-to-last entry no
   * matter how far you scrolled. Measuring against a line — plus an explicit
   * bottom-of-page case — makes every chapter reachable, including the last.
   */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]")
      );
      if (sections.length === 0) return;

      const line = window.innerHeight * ACTIVE_LINE;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
        else break;
      }

      // Once the page bottoms out, no further scrolling can move the line past
      // the last chapter — so pin it there explicitly.
      const scrolledToEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (scrolledToEnd) current = sections[sections.length - 1].id;

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [chapters.length]);

  // Keep the active chip visible in the mobile strip, scrolling the strip only.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    if (strip.scrollWidth <= strip.clientWidth + 1) return;

    const chip = Array.from(
      strip.querySelectorAll<HTMLElement>("[data-chip-id]")
    ).find((el) => el.dataset.chipId === activeId);
    if (!chip) return;

    const stripBox = strip.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const delta =
      chipBox.left + chipBox.width / 2 - (stripBox.left + stripBox.width / 2);
    if (Math.abs(delta) < 16) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo({
      left: strip.scrollLeft + delta,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeId]);

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
        <div
          ref={stripRef}
          className="no-scrollbar flex gap-2 overflow-x-auto [overscroll-behavior-x:contain] [touch-action:pan-x_pan-y_pinch-zoom]"
        >
          {chapters.map((c, i) => (
            <button
              key={c.id}
              data-chip-id={c.id}
              onClick={() =>
                document
                  .getElementById(c.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              aria-current={c.id === activeId ? "true" : undefined}
              aria-label={`Chapter ${i + 1}: ${c.title}`}
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

"use client";

import { useEffect, useMemo, useRef } from "react";
import ProjectCard from "@/components/ProjectCard";
import { ProjectMeta } from "@/content/types";
import { useDevMode } from "@/lib/devmode";

const AUTO_SCROLL_PX_PER_SEC = 22;
const RESUME_DELAY_MS = 2800;

/**
 * Horizontally-scrolling row of project cards for one category.
 * - Locked to horizontal panning only (no diagonal "play" from trackpad/touch).
 * - While this row is the one vertically centered in the viewport and the
 *   user isn't interacting with it, it slowly auto-scrolls and wraps back to
 *   the start on reaching the end.
 */
export default function CategoryRow({ projects }: { projects: ProjectMeta[] }) {
  const { mounted, isFeatured } = useDevMode();

  // `projects` arrives already sorted newest-first. Pull featured projects to
  // the front while preserving that date order within each group (stable
  // partition), so the row reads: featured-by-date, then the rest-by-date.
  // Only after mount, since the featured set lives in localStorage and must
  // not differ between SSR and first client render.
  const ordered = useMemo(() => {
    if (!mounted) return projects;
    const featured = projects.filter((p) => isFeatured(p.slug));
    if (featured.length === 0) return projects;
    const rest = projects.filter((p) => !isFeatured(p.slug));
    return [...featured, ...rest];
  }, [projects, mounted, isFeatured]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const centeredRef = useRef(false);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Track whether this row's section sits in the vertical middle of the
  // viewport — only that row auto-plays.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        centeredRef.current = entry.isIntersecting;
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (projects.length < 2) return;

    const pauseNow = () => {
      pausedRef.current = true;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const scheduleResume = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        pausedRef.current = false;
      }, RESUME_DELAY_MS);
    };
    const onInteractStart = () => pauseNow();
    const onInteractEnd = () => scheduleResume();

    scroller.addEventListener("pointerdown", onInteractStart);
    scroller.addEventListener("wheel", onInteractStart, { passive: true });
    scroller.addEventListener("touchstart", onInteractStart, { passive: true });
    scroller.addEventListener("pointerup", onInteractEnd);
    scroller.addEventListener("touchend", onInteractEnd);
    scroller.addEventListener("wheel", onInteractEnd, { passive: true });

    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (centeredRef.current && !pausedRef.current) {
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        let next = scroller.scrollLeft + AUTO_SCROLL_PX_PER_SEC * dt;
        if (maxScroll <= 0) {
          next = 0;
        } else if (next >= maxScroll) {
          next = 0;
        }
        scroller.scrollLeft = next;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      scroller.removeEventListener("pointerdown", onInteractStart);
      scroller.removeEventListener("wheel", onInteractStart);
      scroller.removeEventListener("touchstart", onInteractStart);
      scroller.removeEventListener("pointerup", onInteractEnd);
      scroller.removeEventListener("touchend", onInteractEnd);
      scroller.removeEventListener("wheel", onInteractEnd);
    };
  }, [projects.length]);

  return (
    <div ref={wrapRef}>
      <div
        ref={scrollerRef}
        className="mt-5 flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden pb-4 [overscroll-behavior-x:contain] [touch-action:pan-x]"
      >
        {ordered.map((p) => (
          <div data-reveal key={p.slug} className="w-96 flex-shrink-0 snap-center">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

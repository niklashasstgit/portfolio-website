"use client";

import { useEffect, useRef } from "react";
import { Chapter } from "@/content/types";
import MediaFrame from "@/components/MediaFrame";
import { useGsap } from "@/lib/gsap";
import DiagramSlot from "./DiagramSlot";

export default function ChapterSection({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Only animate elements that are still below the viewport — anything
    // already visible (or above, after a scroll restore) stays untouched so
    // content can never be stuck hidden.
    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (t) => t.getBoundingClientRect().top > window.innerHeight * 0.9
    );
    if (targets.length === 0) return;

    gsap.set(targets, { autoAlpha: 0, y: 28 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // reveal when entering the viewport, or if the browser's scroll
          // restoration already jumped past this element (top < 0)
          const scrolledPast = entry.boundingClientRect.top < 0;
          if (!entry.isIntersecting && !scrolledPast) return;
          observer.unobserve(entry.target);
          gsap.to(entry.target, {
            autoAlpha: 1,
            y: 0,
            duration: scrolledPast ? 0 : 0.7,
            ease: "power3.out",
          });
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    targets.forEach((t) => observer.observe(t));

    return () => {
      observer.disconnect();
      gsap.set(targets, { clearProps: "all" });
    };
  }, [gsap]);

  const layout = chapter.layout ?? "image-right";
  const media = chapter.media ?? [];

  return (
    <section
      id={chapter.id}
      ref={rootRef}
      data-chapter={index}
      className="scroll-mt-24 border-b border-line py-20 first:pt-4 last:border-b-0 sm:py-28"
    >
      <div
        className={
          layout === "text-only" || layout === "full-bleed"
            ? "flex flex-col gap-10"
            : layout === "gallery" && media.length === 2
              ? "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14"
              : "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14"
        }
      >
        <div
          data-reveal
          className={
            layout === "image-left" && media.length > 0
              ? "order-2 lg:order-2"
              : "order-2 lg:order-1"
          }
        >
          <span className="font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">
            {chapter.kicker}
          </span>
          <h3 className="text-balance mt-3 text-2xl font-semibold text-fg sm:text-3xl">
            {chapter.title}
          </h3>
          <div className="mt-5 space-y-4">
            {chapter.body.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-fg-muted sm:text-base">
                {p}
              </p>
            ))}
          </div>
          {chapter.tags && chapter.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {chapter.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line px-3 py-1 font-mono-tight text-[11px] text-fg-faint"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {layout !== "text-only" && (
          <div
            data-reveal
            className={`order-1 ${
              layout === "image-left" ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {chapter.diagram ? (
              <DiagramSlot name={chapter.diagram} />
            ) : layout === "gallery" && media.length === 2 ? (
              <div className="space-y-5">
                {media.map((m, i) => (
                  <MediaFrame key={i} item={m} sizes="(min-width: 1024px) 900px, 100vw" />
                ))}
              </div>
            ) : layout === "gallery" ? (
              <div className="grid grid-cols-2 gap-3">
                {media.map((m, i) => (
                  <div key={i} className={media.length % 2 === 1 && i === 0 ? "col-span-2" : ""}>
                    <MediaFrame item={m} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {media.map((m, i) => (
                  <MediaFrame key={i} item={m} preload={index === 0} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

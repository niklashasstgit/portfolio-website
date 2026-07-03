"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/lib/gsap";

/**
 * Scroll-reveal wrapper: children marked with [data-reveal] fade/slide in as
 * they enter the viewport, with a small stagger. Uses the same
 * IntersectionObserver pattern as ChapterSection so elements already visible
 * (or scrolled past via scroll restore) are never stuck hidden.
 */
export default function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { gsap } = useGsap();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const all = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    const targets = all.filter(
      (t) => t.getBoundingClientRect().top > window.innerHeight * 0.9
    );
    if (targets.length === 0) return;

    gsap.set(targets, { autoAlpha: 0, y: 32 });

    // stagger siblings that reveal in the same observer tick
    let queue: HTMLElement[] = [];
    let flush = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scrolledPast = entry.boundingClientRect.top < 0;
          if (!entry.isIntersecting && !scrolledPast) return;
          observer.unobserve(entry.target);
          if (scrolledPast) {
            gsap.set(entry.target, { autoAlpha: 1, y: 0 });
            return;
          }
          queue.push(entry.target as HTMLElement);
          cancelAnimationFrame(flush);
          flush = requestAnimationFrame(() => {
            gsap.to(queue, {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.09,
            });
            queue = [];
          });
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    targets.forEach((t) => observer.observe(t));

    return () => {
      observer.disconnect();
      cancelAnimationFrame(flush);
      gsap.set(targets, { clearProps: "all" });
    };
  }, [gsap]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

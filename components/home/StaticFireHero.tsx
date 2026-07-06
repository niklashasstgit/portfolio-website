"use client";

import { useEffect, useRef } from "react";
import { useDevMode } from "@/lib/devmode";

/**
 * Full-viewport hero around the looping static-fire video
 * (/videos/hero-static-fire.mp4, poster /images/hero/hero-poster.webp).
 * The clip is rotated slightly so the plume reads level; scrolling simply
 * continues down to the project catalog.
 *
 * The whole hero sits on a solid black base, and the video element itself is
 * black, so nothing ever flashes white while the clip is still downloading —
 * on a slow connection you see black → poster → moving footage, never a blank
 * light box. The mp4 is encoded with a leading `moov` atom (faststart) so it
 * starts playing before the full file arrives.
 */

// the source clip's plume points ~2.4° upward; rotate clockwise to level it
const VIDEO_TILT_DEG = 2.4;
const VIDEO_SCALE = 1.09; // hides the corners the rotation exposes

export default function StaticFireHero({ children }: { children?: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toggles } = useDevMode();

  // Some mobile browsers ignore the autoplay attribute (iOS Low Power Mode, a
  // backgrounded tab on first paint, aggressive data savers). Nudge playback
  // ourselves and retry when the tab becomes visible or the user first touches
  // the screen; if it's still blocked the poster simply stays put.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      const p = video.play();
      if (p) p.catch(() => {});
    };

    tryPlay();

    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    const onTouch = () => tryPlay();

    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("touchstart", onTouch, { once: true, passive: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-line bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_45%,#151a22_0%,#0c1016_45%,#07090d_100%)]" />

      {/* looping static-fire video, rotated so the plume reads level. The
          container and the <video> are both black so there is never a white
          flash before the footage decodes. The dim overlay tames the clip's
          light background on the dark page. */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {toggles.heroVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero/hero-poster.webp"
            className="absolute inset-0 h-full w-full bg-black object-cover"
            style={{ transform: `rotate(${VIDEO_TILT_DEG}deg) scale(${VIDEO_SCALE})` }}
          >
            <source src="/videos/hero-static-fire.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* legibility gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />

      {/* content */}
      <div className="relative mx-auto mt-auto w-full max-w-6xl px-5 pb-28 pt-40 sm:px-8">
        <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
          Aerospace Engineer
        </span>
        <h1 className="text-balance mt-5 max-w-3xl text-4xl font-semibold leading-tight text-fg [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:text-6xl">
          Building things that fly, orbit, burn, and learn.
        </h1>
        {children}
      </div>

      {/* scroll cue */}
      <a
        href="#projects"
        aria-label="Scroll to projects"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-fg-faint transition-colors hover:text-accent"
      >
        <svg width="22" height="30" viewBox="0 0 22 30" fill="none" aria-hidden>
          <rect x="1" y="1" width="20" height="28" rx="10" stroke="currentColor" strokeWidth="1.5" />
          <circle className="animate-bounce" cx="11" cy="10" r="3" fill="currentColor" />
        </svg>
      </a>
    </section>
  );
}

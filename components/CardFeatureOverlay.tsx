"use client";

import { useDevMode } from "@/lib/devmode";

/**
 * Top-right overlay on a project card.
 * - Dev mode: a star toggle to feature/unfeature the project (filled = featured).
 * - Normal mode: a small "Featured" bubble when the project is featured,
 *   mirroring the subsection tag (which sits top-left). Nothing otherwise.
 * Rendered only after mount so the localStorage-derived state can't cause a
 * hydration mismatch.
 */
export default function CardFeatureOverlay({ slug }: { slug: string }) {
  const { mounted, isDev, isFeatured, toggleFeatured } = useDevMode();
  if (!mounted) return null;

  const featured = isFeatured(slug);

  if (isDev) {
    return (
      <button
        type="button"
        onClick={(e) => {
          // the card is a <Link>; don't navigate when toggling the star
          e.preventDefault();
          e.stopPropagation();
          toggleFeatured(slug);
        }}
        aria-pressed={featured}
        aria-label={featured ? "Remove from featured" : "Mark as featured"}
        title={featured ? "Featured — click to unfeature" : "Click to feature"}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-bg/70 backdrop-blur transition-colors ${
          featured
            ? "border-accent/60 text-accent"
            : "border-line text-fg-muted hover:border-accent hover:text-accent"
        }`}
      >
        <StarIcon filled={featured} />
      </button>
    );
  }

  if (featured) {
    return (
      <span className="font-mono-tight absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-bg/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-accent backdrop-blur">
        <StarIcon filled small />
        Featured
      </span>
    );
  }

  return null;
}

function StarIcon({ filled, small }: { filled?: boolean; small?: boolean }) {
  const s = small ? 11 : 16;
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5l2.9 6.06 6.6.86-4.85 4.55 1.24 6.58L12 18.9l-5.98 2.71 1.24-6.58L2.4 9.42l6.6-.86z" />
    </svg>
  );
}

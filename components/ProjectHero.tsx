import Image from "next/image";

export default function ProjectHero({
  kicker,
  title,
  tagline,
  tags,
  year,
  cover,
  status,
}: {
  kicker: string;
  title: string;
  tagline: string;
  tags: string[];
  year: string;
  cover?: string;
  status?: "flagship" | "category" | "placeholder";
}) {
  return (
    <div className="relative overflow-hidden border-b border-line">
      <div className="bp-grid absolute inset-0 opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
      {cover && (
        <div className="absolute inset-0 -z-10">
          <Image src={cover} alt="" fill className="object-cover opacity-[0.16]" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" />
        </div>
      )}
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
          {kicker}
        </span>
        <h1 className="text-balance mt-4 max-w-3xl text-4xl font-semibold leading-tight text-fg sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="text-balance mt-5 max-w-2xl text-base text-fg-muted sm:text-lg">
          {tagline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="font-mono-tight rounded-full border border-line px-3 py-1 text-xs text-fg-muted">
            {year}
          </span>
          {status === "placeholder" && (
            <span className="font-mono-tight rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs text-accent">
              journey in progress — real photos coming soon
            </span>
          )}
          {tags.map((t) => (
            <span
              key={t}
              className="font-mono-tight rounded-full border border-line px-3 py-1 text-xs text-fg-faint"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

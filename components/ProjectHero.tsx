import Image from "next/image";
import {
  ProjectLink,
  ProjectDisclaimer,
  disclaimerText,
} from "@/content/types";

/** One row of the hero spec block — only rendered when it has a value. */
function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-mono-tight text-[10px] uppercase tracking-[0.18em] text-fg-faint">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-fg-muted">{value}</dd>
    </div>
  );
}

export default function ProjectHero({
  kicker,
  title,
  tagline,
  tags,
  year,
  cover,
  role,
  duration,
  team,
  tools,
  links,
  disclaimer,
}: {
  kicker: string;
  title: string;
  tagline: string;
  tags: string[];
  year: string;
  cover?: string;
  role?: string;
  duration?: string;
  team?: string;
  tools?: string[];
  links?: ProjectLink[];
  disclaimer?: ProjectDisclaimer;
}) {
  const hasSpec = Boolean(role || duration || team || tools?.length);

  return (
    <div className="relative overflow-hidden border-b border-line">
      <div className="bp-grid absolute inset-0 opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
      {cover && (
        <div className="absolute inset-0 -z-10">
          <Image src={cover} alt="" fill sizes="100vw" className="object-cover opacity-[0.32]" preload />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/25 via-bg/65 to-bg" />
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
          {tags.map((t) => (
            <span
              key={t}
              className="font-mono-tight rounded-full border border-line px-3 py-1 text-xs text-fg-faint"
            >
              {t}
            </span>
          ))}
        </div>

        {hasSpec && (
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            <Spec label="Role" value={role} />
            <Spec label="Duration" value={duration} />
            <Spec label="Team" value={team} />
            <Spec label="Tools" value={tools?.join(", ")} />
          </dl>
        )}

        {links && links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-tight rounded-full border border-line px-4 py-2 text-xs text-fg transition-colors hover:border-accent hover:text-accent"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        {disclaimer && (
          <div className="mt-10 max-w-3xl rounded-lg border border-accent/30 bg-accent-soft px-5 py-4">
            <p className="font-mono-tight text-[10px] uppercase tracking-[0.18em] text-accent">
              Public information only
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {disclaimerText(disclaimer)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

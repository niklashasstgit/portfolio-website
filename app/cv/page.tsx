import type { Metadata } from "next";
import Link from "next/link";
import {
  cvBasics,
  employment,
  education,
  associations,
  skills,
  cvProjects,
} from "@/content/cv";

export const metadata: Metadata = {
  title: "CV — Niklas Blattner",
  description: "Full CV: employment history, education, and project list.",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
      {children}
    </h2>
  );
}

export default function CvPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tight text-xs uppercase tracking-[0.25em] text-accent">
            Curriculum Vitae
          </span>
          <h1 className="mt-3 text-4xl font-semibold text-fg sm:text-5xl">{cvBasics.name}</h1>
          <p className="mt-3 text-fg-muted">{cvBasics.location}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-fg-muted">
            <a href={`mailto:${cvBasics.email}`} className="hover:text-accent">
              {cvBasics.email}
            </a>
            <a href={`tel:${cvBasics.phone.replace(/\s/g, "")}`} className="hover:text-accent">
              {cvBasics.phone}
            </a>
            <a
              href={cvBasics.linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {cvBasics.linkedin}
            </a>
          </div>
        </div>
        <a
          href="/cv/Niklas_Blattner_CV.pdf"
          download
          className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          Download PDF ↓
        </a>
      </div>

      {/* Employment */}
      <div className="mt-14">
        <SectionHeading>Employment History</SectionHeading>
        <div className="mt-6 space-y-8">
          {employment.map((e) => (
            <div key={e.role} className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr] sm:gap-6">
              <span className="font-mono-tight text-sm text-fg-faint">{e.period}</span>
              <div>
                <h3 className="font-semibold text-fg">{e.role}</h3>
                <p className="text-sm text-fg-muted">{e.org}</p>
                <ul className="mt-2 space-y-1.5">
                  {e.bullets.map((b, i) => (
                    <li key={i} className="text-sm leading-relaxed text-fg-muted">
                      — {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mt-16">
        <SectionHeading>Education</SectionHeading>
        <div className="mt-6 space-y-8">
          {education.map((e) => (
            <div key={e.degree} className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr] sm:gap-6">
              <span className="font-mono-tight text-sm text-fg-faint">{e.period}</span>
              <div>
                <h3 className="font-semibold text-fg">{e.degree}</h3>
                <p className="text-sm text-fg-muted">{e.org}</p>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Associations */}
      <div className="mt-16">
        <SectionHeading>University Student Associations</SectionHeading>
        <div className="mt-6 space-y-8">
          {associations.map((a) => (
            <div key={a.org} className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr] sm:gap-6">
              <span className="font-mono-tight text-sm text-fg-faint">{a.period}</span>
              <div>
                <h3 className="font-semibold text-fg">
                  {a.role} — {a.org}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{a.detail}</p>
                {a.href && (
                  <Link href={a.href} className="mt-2 inline-block text-sm text-accent hover:underline">
                    See the project journey →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-16">
        <SectionHeading>Skills</SectionHeading>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            ["Languages", skills.languages],
            ["Coding", skills.coding],
            ["Software", skills.software],
            ["Misc.", skills.misc],
          ].map(([label, items]) => (
            <div key={label as string}>
              <h3 className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
                {label as string}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(items as string[]).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
            Soft Skills
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">{skills.soft.join(" · ")}</p>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-16">
        <SectionHeading>Projects</SectionHeading>
        {cvProjects.map((group) => (
          <div key={group.group} className="mt-8">
            <h3 className="text-lg font-semibold text-fg">{group.group}</h3>
            <div className="mt-4 space-y-4">
              {group.items.map((p) => (
                <div
                  key={p.title}
                  className="grid grid-cols-1 gap-1 border-b border-line pb-4 sm:grid-cols-[80px_1fr] sm:gap-6"
                >
                  <span className="font-mono-tight text-sm text-fg-faint">{p.year}</span>
                  <div>
                    {p.href ? (
                      <Link href={p.href} className="text-sm font-medium text-fg hover:text-accent">
                        {p.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-fg">{p.title}</p>
                    )}
                    <p className="mt-1 text-xs text-fg-faint">{p.skills.join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

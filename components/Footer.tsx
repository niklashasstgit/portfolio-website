import Link from "next/link";
import { cvBasics } from "@/content/cv";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono-tight text-sm text-fg">{cvBasics.name}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Aerospace engineer — {cvBasics.location}
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm text-fg-muted sm:items-end">
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
        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 text-xs text-fg-faint sm:flex-row sm:items-center">
          <p className="font-mono-tight">© {new Date().getFullYear()} Niklas Blattner</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-fg-muted">
              Home
            </Link>
            <Link href="/projects" className="hover:text-fg-muted">
              Projects
            </Link>
            <Link href="/cv" className="hover:text-fg-muted">
              CV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
